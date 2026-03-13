using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HouseToHome.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestimonialsController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<TestimonialsController> _logger;

        private static readonly JsonSerializerOptions WriteOpts = new() { WriteIndented = true };

        public TestimonialsController(IConfiguration config, ILogger<TestimonialsController> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ── GET /api/testimonials ─────────────────────────────────────────────
        // Returns all submitted testimonials from testimonials.json
        [HttpGet]
        public async Task<IActionResult> GetTestimonials()
        {
            var path = GetPath();
            var items = await SafeReadArray(path);
            _logger.LogInformation("Testimonials GET: {Count} items", items.Count);
            return Content(JsonSerializer.Serialize(items, WriteOpts), "application/json");
        }

        // ── POST /api/testimonials ────────────────────────────────────────────
        // Body: { name, initials, review, rating, date }
        // Appends to testimonials.json
        [HttpPost]
        public async Task<IActionResult> AddTestimonial([FromBody] JsonElement body)
        {
            var required = new[] { "name", "review", "rating" };
            foreach (var field in required)
                if (!body.TryGetProperty(field, out _))
                    return BadRequest(new { message = $"Missing required field: {field}" });

            EnsureDataDir();
            var path = GetPath();
            var items = await SafeReadArray(path);

            // Build the new entry, stamping id and date server-side
            using var ms = new System.IO.MemoryStream();
            using (var w = new Utf8JsonWriter(ms))
            {
                w.WriteStartObject();
                w.WriteNumber("id", DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
                w.WriteString("date", DateTime.UtcNow.ToString("o"));
                foreach (var p in body.EnumerateObject())
                {
                    // Skip client-supplied id/date so server values win
                    if (p.Name == "id" || p.Name == "date") continue;
                    p.WriteTo(w);
                }
                w.WriteEndObject();
            }
            var entry = JsonDocument.Parse(ms.ToArray()).RootElement.Clone();
            items.Add(entry);

            await System.IO.File.WriteAllTextAsync(path, JsonSerializer.Serialize(items, WriteOpts));

            _logger.LogInformation("Testimonials POST: saved {Name}", 
                body.TryGetProperty("name", out var n) ? n.GetString() : "unknown");

            return Ok(new { message = "Testimonial saved.", count = items.Count });
        }

        // ── DELETE /api/testimonials/{id} ─────────────────────────────────────
        // Removes a testimonial by id (admin use)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTestimonial(long id)
        {
            var path = GetPath();
            var items = await SafeReadArray(path);
            var before = items.Count;
            items = items.Where(e =>
            {
                if (e.TryGetProperty("id", out var idProp))
                    return idProp.ValueKind == JsonValueKind.Number && idProp.GetInt64() != id;
                return true;
            }).ToList();

            if (items.Count == before)
                return NotFound(new { message = $"Testimonial {id} not found." });

            await System.IO.File.WriteAllTextAsync(path, JsonSerializer.Serialize(items, WriteOpts));
            _logger.LogInformation("Testimonials DELETE: removed id {Id}", id);
            return Ok(new { message = $"Testimonial {id} deleted." });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private string GetPath()
        {
            var dir = _config["DataPaths:Directory"]
                ?? System.IO.Path.Combine(AppContext.BaseDirectory, "data");
            return System.IO.Path.Combine(dir, "testimonials.json");
        }

        private void EnsureDataDir()
        {
            var dir = System.IO.Path.GetDirectoryName(GetPath())!;
            if (!System.IO.Directory.Exists(dir))
                System.IO.Directory.CreateDirectory(dir);
        }

        private static async Task<List<JsonElement>> SafeReadArray(string path)
        {
            if (!System.IO.File.Exists(path)) return new();
            try
            {
                var json = await System.IO.File.ReadAllTextAsync(path);
                return JsonSerializer.Deserialize<List<JsonElement>>(json) ?? new();
            }
            catch { return new(); }
        }
    }
}
