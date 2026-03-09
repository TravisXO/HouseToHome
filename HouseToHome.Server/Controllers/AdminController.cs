using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using HouseToHome.Server.Data;

namespace HouseToHome.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly ILogger<AdminController> _logger;

        private static readonly JsonSerializerOptions WriteOpts = new()
        {
            WriteIndented = true,
        };

        public AdminController(AppDbContext db, ILogger<AdminController> logger)
        {
            _db = db;
            _logger = logger;
        }

        // ── GET /api/admin/properties ─────────────────────────────────
        // Mirrors AdminPage.jsx load logic:
        //   1. Read all-properties.json           → _source: "legacy"
        //   2. Read housetohome-properties-rent.json → _source: "custom"
        //   3. Read housetohome-properties-buy.json  → _source: "custom"
        //   4. Merge: custom entries override legacy entries with the same ID
        //   5. Return the merged flat array
        [HttpGet("properties")]
        public async Task<IActionResult> GetProperties()
        {
            var legacyPath = FindJsonFile("all-properties.json");
            if (legacyPath == null)
                return NotFound(new { message = "Make sure all-properties.json exists in src/data/" });

            var legacyJson = await System.IO.File.ReadAllTextAsync(legacyPath);
            var legacy = JsonSerializer.Deserialize<List<JsonElement>>(legacyJson)
                         ?? new List<JsonElement>();

            // Load the two custom split files — return empty list if they don't exist yet
            var customRent = await SafeReadJsonArray(FindJsonFile("housetohome-properties-rent.json"));
            var customBuy = await SafeReadJsonArray(FindJsonFile("housetohome-properties-buy.json"));
            var customAll = customRent.Concat(customBuy).ToList();

            // Build a set of IDs that are already in the custom files
            var customIds = customAll
                .Select(e => GetId(e))
                .Where(id => id != null)
                .ToHashSet();

            // Filter legacy: skip any entry whose ID already exists in custom files
            var filteredLegacy = legacy
                .Where(e => !customIds.Contains(GetId(e)))
                .Select(e => TagSource(e, "legacy"))
                .ToList();

            var taggedCustom = customAll
                .Select(e => TagSource(e, "custom"))
                .ToList();

            var merged = filteredLegacy.Concat(taggedCustom).ToList();

            _logger.LogInformation(
                "Admin GET: {Legacy} legacy + {Custom} custom = {Total} total",
                filteredLegacy.Count, taggedCustom.Count, merged.Count);

            var resultJson = JsonSerializer.Serialize(merged, WriteOpts);
            return Content(resultJson, "application/json");
        }

        // ── POST /api/admin/properties ────────────────────────────────
        // AdminPage.jsx sends: { rent: [...], buy: [...] }
        // Writes each array to its own file, then removes those IDs from
        // all-properties.json so legacy entries don't show up as duplicates.
        [HttpPost("properties")]
        public async Task<IActionResult> SaveProperties([FromBody] JsonElement body)
        {
            // Extract the rent and buy arrays from the payload
            if (!body.TryGetProperty("rent", out var rentEl) ||
                !body.TryGetProperty("buy", out var buyEl))
            {
                return BadRequest(new { message = "Body must contain { rent: [...], buy: [...] }" });
            }

            var rentItems = JsonSerializer.Deserialize<List<JsonElement>>(rentEl.GetRawText())
                            ?? new List<JsonElement>();
            var buyItems = JsonSerializer.Deserialize<List<JsonElement>>(buyEl.GetRawText())
                            ?? new List<JsonElement>();

            // Resolve output paths next to all-properties.json
            var legacyPath = FindJsonFile("all-properties.json");
            if (legacyPath == null)
                return StatusCode(500, new { message = "Could not locate all-properties.json to resolve output path." });

            var dataDir = System.IO.Path.GetDirectoryName(legacyPath)!;
            var rentPath = System.IO.Path.Combine(dataDir, "housetohome-properties-rent.json");
            var buyPath = System.IO.Path.Combine(dataDir, "housetohome-properties-buy.json");

            // Ensure every property has a Slug before writing
            rentItems = rentItems.Select(EnsureSlug).ToList();
            buyItems = buyItems.Select(EnsureSlug).ToList();

            // Write the split files
            await System.IO.File.WriteAllTextAsync(
                rentPath, JsonSerializer.Serialize(rentItems, WriteOpts));
            await System.IO.File.WriteAllTextAsync(
                buyPath, JsonSerializer.Serialize(buyItems, WriteOpts));

            _logger.LogInformation(
                "Admin POST: wrote {Rent} rent + {Buy} buy items",
                rentItems.Count, buyItems.Count);

            // Remove migrated IDs from all-properties.json so the legacy file
            // no longer contains entries that are now managed in the split files
            var allCustomIds = rentItems.Concat(buyItems)
                .Select(e => GetId(e))
                .Where(id => id != null)
                .ToHashSet();

            await PruneLegacyFile(legacyPath, allCustomIds!);

            return Ok(new
            {
                message = "Saved.",
                rentPath,
                buyPath,
                rentCount = rentItems.Count,
                buyCount = buyItems.Count,
            });
        }

        // ── POST /api/admin/reseed ────────────────────────────────────
        [HttpPost("reseed")]
        public async Task<IActionResult> Reseed()
        {
            _logger.LogInformation("Admin: clearing properties table for re-seed...");
            _db.Properties.RemoveRange(_db.Properties);
            await _db.SaveChangesAsync();

            await DataSeeder.SeedAsync(_db, _logger);

            var count = _db.Properties.Count();
            _logger.LogInformation("Admin: re-seed complete — {Count} properties in DB.", count);
            return Ok(new { message = $"Re-seeded successfully. {count} properties now in database." });
        }

        // ── Helpers ───────────────────────────────────────────────────

        /// <summary>
        /// Reads a JSON file as a list of elements. Returns an empty list if the
        /// file path is null or the file doesn't exist yet.
        /// </summary>
        private static async Task<List<JsonElement>> SafeReadJsonArray(string? path)
        {
            if (path == null || !System.IO.File.Exists(path))
                return new List<JsonElement>();

            try
            {
                var json = await System.IO.File.ReadAllTextAsync(path);
                return JsonSerializer.Deserialize<List<JsonElement>>(json)
                       ?? new List<JsonElement>();
            }
            catch
            {
                return new List<JsonElement>();
            }
        }

        /// <summary>
        /// Extracts the ID field from a raw JSON element (handles "ID" or "id").
        /// </summary>
        private static string? GetId(JsonElement el)
        {
            if (el.TryGetProperty("ID", out var v) && v.ValueKind == JsonValueKind.String)
                return v.GetString();
            if (el.TryGetProperty("id", out v) && v.ValueKind == JsonValueKind.String)
                return v.GetString();
            return null;
        }

        /// <summary>
        /// Returns a new JsonElement with a _source field added.
        /// </summary>
        private static JsonElement TagSource(JsonElement el, string source)
        {
            // Rebuild the object with _source injected
            using var ms = new System.IO.MemoryStream();
            using (var writer = new Utf8JsonWriter(ms))
            {
                writer.WriteStartObject();
                writer.WriteString("_source", source);
                foreach (var prop in el.EnumerateObject())
                {
                    // Skip existing _source so we don't duplicate it
                    if (prop.Name == "_source") continue;
                    prop.WriteTo(writer);
                }
                writer.WriteEndObject();
            }
            var doc = JsonDocument.Parse(ms.ToArray());
            return doc.RootElement.Clone();
        }

        /// <summary>
        /// Ensures a property element has a non-empty Slug field.
        /// If missing, generates one from Title + first 8 chars of ID.
        /// </summary>
        private static JsonElement EnsureSlug(JsonElement el)
        {
            if (el.TryGetProperty("Slug", out var existing) &&
                existing.ValueKind == JsonValueKind.String &&
                !string.IsNullOrWhiteSpace(existing.GetString()))
                return el;

            var title = el.TryGetProperty("Title", out var t) ? t.GetString() ?? "" : "";
            var id = GetId(el) ?? Guid.NewGuid().ToString("N");
            var slug = Slugify(title) + "-" + id[..Math.Min(8, id.Length)];

            using var ms = new System.IO.MemoryStream();
            using (var writer = new Utf8JsonWriter(ms))
            {
                writer.WriteStartObject();
                writer.WriteString("Slug", slug);
                foreach (var prop in el.EnumerateObject())
                {
                    if (prop.Name == "Slug") continue;
                    prop.WriteTo(writer);
                }
                writer.WriteEndObject();
            }
            var doc = JsonDocument.Parse(ms.ToArray());
            return doc.RootElement.Clone();
        }

        private static string Slugify(string text)
        {
            var slug = text.ToLowerInvariant();
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"\s+", "-");
            slug = System.Text.RegularExpressions.Regex.Replace(slug, @"-+", "-").Trim('-');
            return slug.Length > 80 ? slug[..80] : slug;
        }

        /// <summary>
        /// Removes entries from all-properties.json whose IDs are in the given set.
        /// This "migrates" legacy entries as they get saved through the admin.
        /// </summary>
        private async Task PruneLegacyFile(string legacyPath, HashSet<string> idsToRemove)
        {
            try
            {
                var json = await System.IO.File.ReadAllTextAsync(legacyPath);
                var all = JsonSerializer.Deserialize<List<JsonElement>>(json)
                              ?? new List<JsonElement>();
                var pruned = all.Where(e => !idsToRemove.Contains(GetId(e) ?? "")).ToList();

                if (pruned.Count < all.Count)
                {
                    await System.IO.File.WriteAllTextAsync(
                        legacyPath, JsonSerializer.Serialize(pruned, WriteOpts));
                    _logger.LogInformation(
                        "Admin POST: pruned {Count} migrated entries from all-properties.json",
                        all.Count - pruned.Count);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Admin POST: could not prune legacy file — {Msg}", ex.Message);
            }
        }

        /// <summary>
        /// Walks up the directory tree from AppContext.BaseDirectory looking for
        /// the file in common locations. Mirrors DataSeeder.FindJsonFile.
        /// </summary>
        private static string? FindJsonFile(string filename)
        {
            var dir = AppContext.BaseDirectory;
            for (var i = 0; i < 6; i++)
            {
                var candidate = System.IO.Path.Combine(dir, "src", "data", filename);
                if (System.IO.File.Exists(candidate)) return candidate;

                candidate = System.IO.Path.Combine(dir, filename);
                if (System.IO.File.Exists(candidate)) return candidate;

                try
                {
                    foreach (var clientDir in System.IO.Directory.GetDirectories(
                        dir, "*client*", System.IO.SearchOption.TopDirectoryOnly))
                    {
                        candidate = System.IO.Path.Combine(clientDir, "src", "data", filename);
                        if (System.IO.File.Exists(candidate)) return candidate;
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