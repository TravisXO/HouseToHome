using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HouseToHome.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<AdminController> _logger;

        private static readonly JsonSerializerOptions WriteOpts = new() { WriteIndented = true };

        public AdminController(IConfiguration config, ILogger<AdminController> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ── GET /api/admin/properties ─────────────────────────────────────────
        // 1. Read all-properties.json  → _source: "legacy"
        // 2. Read Rent.json            → _source: "managed"
        // 3. Read Buy.json             → _source: "managed"
        // 4. Merge: managed entries override legacy entries with the same ID
        // 5. Return merged flat array
        [HttpGet("properties")]
        public async Task<IActionResult> GetProperties()
        {
            var legacyItems = await SafeReadArray(FindLegacyFile());

            var rentItems = await SafeReadArray(GetManagedPath("Rent.json"));
            var buyItems = await SafeReadArray(GetManagedPath("Buy.json"));
            var managedItems = rentItems.Concat(buyItems).ToList();

            var managedIds = managedItems
                .Select(GetId).Where(id => id != null).ToHashSet();

            var result = managedItems.Select(e => TagSource(e, "managed"))
                .Concat(legacyItems
                    .Where(e => !managedIds.Contains(GetId(e)))
                    .Select(e => TagSource(e, "legacy")))
                .ToList();

            _logger.LogInformation(
                "Admin GET: {M} managed + {L} legacy = {T} total",
                managedItems.Count, result.Count - managedItems.Count, result.Count);

            return Content(JsonSerializer.Serialize(result, WriteOpts), "application/json");
        }

        // ── POST /api/admin/properties ────────────────────────────────────────
        // Body: { rent: [...], buy: [...] }
        // Writes each array to Rent.json / Buy.json.
        // Prunes saved IDs from all-properties.json (legacy migration).
        [HttpPost("properties")]
        public async Task<IActionResult> SaveProperties([FromBody] JsonElement body)
        {
            if (!body.TryGetProperty("rent", out var rentEl) ||
                !body.TryGetProperty("buy", out var buyEl))
                return BadRequest(new { message = "Body must be { rent: [...], buy: [...] }" });

            var rentItems = Deserialise(rentEl).Select(EnsureSlug).ToList();
            var buyItems = Deserialise(buyEl).Select(EnsureSlug).ToList();

            EnsureDataDir();
            var rentPath = GetManagedPath("Rent.json");
            var buyPath = GetManagedPath("Buy.json");

            await System.IO.File.WriteAllTextAsync(rentPath, JsonSerializer.Serialize(rentItems, WriteOpts));
            await System.IO.File.WriteAllTextAsync(buyPath, JsonSerializer.Serialize(buyItems, WriteOpts));

            _logger.LogInformation("Admin POST: {R} rent + {B} buy saved", rentItems.Count, buyItems.Count);

            // Prune migrated IDs from legacy file so they no longer show as duplicates
            var allSavedIds = rentItems.Concat(buyItems)
                .Select(GetId).Where(id => id != null).ToHashSet();
            await PruneLegacyFile(allSavedIds!);

            return Ok(new
            {
                message = "Saved.",
                rentPath,
                buyPath,
                rentCount = rentItems.Count,
                buyCount = buyItems.Count
            });
        }

        // ── DELETE /api/admin/properties/{id} ─────────────────────────────────
        // Removes property from Rent.json or Buy.json (or legacy file if not yet migrated).
        // NOTE: Cloudinary media is deleted separately via DELETE /api/cloudinary
        [HttpDelete("properties/{id}")]
        public async Task<IActionResult> DeleteProperty(string id)
        {
            var deleted = false;
            foreach (var file in new[] { GetManagedPath("Rent.json"), GetManagedPath("Buy.json") })
            {
                var items = await SafeReadArray(file);
                var before = items.Count;
                items = items.Where(e => GetId(e) != id).ToList();
                if (items.Count < before)
                {
                    await System.IO.File.WriteAllTextAsync(file, JsonSerializer.Serialize(items, WriteOpts));
                    deleted = true;
                    _logger.LogInformation("Deleted {Id} from {File}", id, System.IO.Path.GetFileName(file));
                }
            }

            if (!deleted)
                await PruneLegacyFile(new HashSet<string> { id });

            return Ok(new { message = $"Property {id} deleted." });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private string GetManagedPath(string filename)
        {
            var dir = _config["DataPaths:Directory"]
                ?? System.IO.Path.Combine(AppContext.BaseDirectory, "data");
            return System.IO.Path.Combine(dir, filename);
        }

        private void EnsureDataDir()
        {
            var dir = System.IO.Path.GetDirectoryName(GetManagedPath("_"))!;
            if (!System.IO.Directory.Exists(dir))
                System.IO.Directory.CreateDirectory(dir);
        }

        private static async Task<List<JsonElement>> SafeReadArray(string? path)
        {
            if (path == null || !System.IO.File.Exists(path)) return new();
            try
            {
                var json = await System.IO.File.ReadAllTextAsync(path);
                return JsonSerializer.Deserialize<List<JsonElement>>(json) ?? new();
            }
            catch { return new(); }
        }

        private static List<JsonElement> Deserialise(JsonElement el)
            => JsonSerializer.Deserialize<List<JsonElement>>(el.GetRawText()) ?? new();

        private static string? GetId(JsonElement el)
        {
            foreach (var key in new[] { "id", "ID" })
                if (el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String)
                    return v.GetString();
            return null;
        }

        private static JsonElement TagSource(JsonElement el, string source)
        {
            using var ms = new System.IO.MemoryStream();
            using (var w = new Utf8JsonWriter(ms))
            {
                w.WriteStartObject();
                w.WriteString("_source", source);
                foreach (var p in el.EnumerateObject())
                {
                    if (p.Name == "_source") continue;
                    p.WriteTo(w);
                }
                w.WriteEndObject();
            }
            return JsonDocument.Parse(ms.ToArray()).RootElement.Clone();
        }

        private static JsonElement EnsureSlug(JsonElement el)
        {
            if (el.TryGetProperty("slug", out var s) &&
                s.ValueKind == JsonValueKind.String &&
                !string.IsNullOrWhiteSpace(s.GetString()))
                return el;

            var title = el.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
            var id = GetId(el) ?? Guid.NewGuid().ToString("N");
            var slug = Slugify(title) + "-" + id[..Math.Min(8, id.Length)];

            using var ms = new System.IO.MemoryStream();
            using (var w = new Utf8JsonWriter(ms))
            {
                w.WriteStartObject();
                w.WriteString("slug", slug);
                foreach (var p in el.EnumerateObject())
                {
                    if (p.Name == "slug") continue;
                    p.WriteTo(w);
                }
                w.WriteEndObject();
            }
            return JsonDocument.Parse(ms.ToArray()).RootElement.Clone();
        }

        private static string Slugify(string text)
        {
            var s = text.ToLowerInvariant();
            s = System.Text.RegularExpressions.Regex.Replace(s, @"[^a-z0-9\s-]", "");
            s = System.Text.RegularExpressions.Regex.Replace(s, @"\s+", "-");
            s = System.Text.RegularExpressions.Regex.Replace(s, @"-+", "-").Trim('-');
            return s.Length > 80 ? s[..80] : s;
        }

        private async Task PruneLegacyFile(HashSet<string> idsToRemove)
        {
            var legacyPath = FindLegacyFile();
            if (legacyPath == null) return;
            try
            {
                var items = await SafeReadArray(legacyPath);
                var pruned = items.Where(e => !idsToRemove.Contains(GetId(e) ?? "")).ToList();
                if (pruned.Count < items.Count)
                {
                    await System.IO.File.WriteAllTextAsync(legacyPath,
                        JsonSerializer.Serialize(pruned, WriteOpts));
                    _logger.LogInformation("Pruned {N} entries from all-properties.json",
                        items.Count - pruned.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Could not prune legacy file: {Msg}", ex.Message);
            }
        }

        /// <summary>Walks up the directory tree to locate all-properties.json.</summary>
        private static string? FindLegacyFile()
        {
            var dir = AppContext.BaseDirectory;
            for (var i = 0; i < 6; i++)
            {
                foreach (var rel in new[] {
                    System.IO.Path.Combine("src", "data", "all-properties.json"),
                    "all-properties.json" })
                {
                    var c = System.IO.Path.Combine(dir, rel);
                    if (System.IO.File.Exists(c)) return c;
                }

                try
                {
                    foreach (var clientDir in System.IO.Directory.GetDirectories(
                        dir, "*client*", System.IO.SearchOption.TopDirectoryOnly))
                    {
                        var c = System.IO.Path.Combine(clientDir, "src", "data", "all-properties.json");
                        if (System.IO.File.Exists(c)) return c;
                    }
                }
                catch (UnauthorizedAccessException) { }

                var parent = System.IO.Directory.GetParent(dir)?.FullName;
                if (parent == null) break;
                dir = parent;
            }
            return null;
        }
    }
}