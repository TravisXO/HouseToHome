using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;

namespace HouseToHome.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<PropertiesController> _logger;

        public PropertiesController(IConfiguration config, ILogger<PropertiesController> logger)
        {
            _config = config;
            _logger = logger;
        }

        // ── GET /api/properties ───────────────────────────────────────────────
        // Supports all filters:
        //   listingType    = "Rent" | "Sale"
        //   propertyStatus = "Residential" | "Commercial" | "Land" | "Investment"
        //   propertyType   = "House" | "Apartment" | etc.
        //   currency       = "$" | "K"
        //   minPrice       = decimal
        //   maxPrice       = decimal
        //   bedrooms       = 1..5+  (returns >= this value)
        //   bathrooms      = 1..5+  (returns >= this value)
        //   q              = free-text on title + location
        //   page / pageSize
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? listingType = null,
            [FromQuery] string? propertyStatus = null,
            [FromQuery] string? propertyType = null,
            [FromQuery] string? currency = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int? bedrooms = null,
            [FromQuery] int? bathrooms = null,
            [FromQuery] string? q = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 12)
        {
            var all = await LoadAllAsync();

            // ── Apply filters ─────────────────────────────────────────────────
            var filtered = all.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(listingType))
                filtered = filtered.Where(p =>
                    string.Equals(p.ListingType, listingType, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(propertyStatus))
                filtered = filtered.Where(p =>
                    string.Equals(p.PropertyStatus, propertyStatus, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(propertyType))
                filtered = filtered.Where(p =>
                    string.Equals(p.PropertyType, propertyType, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(currency))
                filtered = filtered.Where(p =>
                    string.Equals(p.Currency, currency, StringComparison.OrdinalIgnoreCase));

            if (minPrice.HasValue)
                filtered = filtered.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                filtered = filtered.Where(p => p.Price <= maxPrice.Value);

            if (bedrooms.HasValue)
                filtered = filtered.Where(p => p.Bedrooms >= bedrooms.Value);

            if (bathrooms.HasValue)
                filtered = filtered.Where(p => p.Bathrooms >= bathrooms.Value);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                filtered = filtered.Where(p =>
                    (p.Title?.ToLower().Contains(term) ?? false) ||
                    (p.Location?.ToLower().Contains(term) ?? false));
            }

            var list = filtered.OrderByDescending(p => p.CreatedDate).ToList();
            var total = list.Count;
            var items = list.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            return Ok(new PropertyPageResult
            {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Pages = (int)Math.Ceiling((double)total / pageSize),
                Items = items,
            });
        }

        // ── GET /api/properties/{slug} ────────────────────────────────────────
        [HttpGet("{slug}")]
        public async Task<IActionResult> GetBySlug(string slug)
        {
            var all = await LoadAllAsync();
            var property = all.FirstOrDefault(p =>
                string.Equals(p.Slug, slug, StringComparison.OrdinalIgnoreCase));

            if (property == null) return NotFound();
            return Ok(property);
        }

        // ── Data loading ──────────────────────────────────────────────────────

        private async Task<List<PropertyDto>> LoadAllAsync()
        {
            var rentItems = await SafeReadArray(GetManagedPath("Rent.json"));
            var buyItems = await SafeReadArray(GetManagedPath("Buy.json"));
            var legacyItems = await SafeReadArray(FindLegacyFile());

            var managedIds = rentItems.Concat(buyItems)
                .Select(GetId).Where(id => id != null).ToHashSet();

            // Managed items take precedence; legacy items fill in the rest
            var all = rentItems.Concat(buyItems)
                .Select(e => Normalise(e, isLegacy: false))
                .Concat(legacyItems
                    .Where(e => !managedIds.Contains(GetId(e)))
                    .Select(e => Normalise(e, isLegacy: true)))
                .Where(p => p != null)
                .Select(p => p!)
                .ToList();

            _logger.LogDebug("Properties loaded: {Count} total", all.Count);
            return all;
        }

        /// <summary>
        /// Normalises both the legacy Wix format and the new camelCase format
        /// into a consistent PropertyDto.
        /// </summary>
        private static PropertyDto? Normalise(JsonElement el, bool isLegacy)
        {
            try
            {
                // Detect format: legacy Wix uses "Title" (PascalCase) with array fields
                bool isWix = el.TryGetProperty("Title", out _) && el.TryGetProperty("ID", out _);

                if (isWix)
                    return NormaliseWix(el);
                else
                    return NormaliseCamel(el);
            }
            catch { return null; }
        }

        private static PropertyDto NormaliseWix(JsonElement el)
        {
            var listingType = ArrFirst(el, "Listing Type", "Rent");
            // "Buy" in the Wix export → "Sale"
            if (string.Equals(listingType, "Buy", StringComparison.OrdinalIgnoreCase))
                listingType = "Sale";

            var pricingLabel = GetStr(el, "Pricing");

            return new PropertyDto
            {
                Id = GetStr(el, "ID"),
                Slug = GetStr(el, "Slug").Length > 0 ? GetStr(el, "Slug") : GetStr(el, "ID"),
                Title = GetStr(el, "Title"),
                Description = "",
                Location = GetStr(el, "Location"),
                ListingType = listingType,
                PropertyStatus = ArrFirst(el, "Propety Status", "Residential"),  // Wix typo preserved
                PropertyType = ArrFirst(el, "Property Type", "House"),
                FurnishingStatus = ArrFirst(el, "Furnishing Status", ""),
                Bedrooms = GetInt(el, "Bedrooms"),
                Bathrooms = GetInt(el, "Bathroom"),
                LotSize = GetStr(el, "Lot Size"),
                Currency = ArrFirst(el, "Currency", "$"),
                PricingLabel = pricingLabel,
                Price = ParsePrice(pricingLabel),
                Amenities = GetStr(el, "Ammenities"),  // Wix typo preserved
                Images = GetRawImages(el, "Property Image"),
                Videos = new List<MediaItem>(),
                CreatedDate = DateTime.UtcNow,
            };
        }

        private static PropertyDto NormaliseCamel(JsonElement el)
        {
            var pricingLabel = GetStr(el, "pricingLabel");

            return new PropertyDto
            {
                Id = GetStr(el, "id"),
                Slug = GetStr(el, "slug"),
                Title = GetStr(el, "title"),
                Description = GetStr(el, "description"),
                Location = GetStr(el, "location"),
                ListingType = GetStr(el, "listingType"),
                PropertyStatus = GetStr(el, "propertyStatus"),
                PropertyType = GetStr(el, "propertyType"),
                FurnishingStatus = GetStr(el, "furnishingStatus"),
                Bedrooms = GetInt(el, "bedrooms"),
                Bathrooms = GetInt(el, "bathrooms"),
                LotSize = GetStr(el, "lotSize"),
                Currency = GetStr(el, "currency"),
                PricingLabel = pricingLabel,
                Price = el.TryGetProperty("price", out var pr) && pr.ValueKind == JsonValueKind.Number
                                        ? pr.GetDecimal() : ParsePrice(pricingLabel),
                Amenities = GetStr(el, "amenities"),
                Images = GetMediaItems(el, "images"),
                Videos = GetMediaItems(el, "videos"),
                CreatedDate = el.TryGetProperty("createdDate", out var dt) &&
                                   dt.TryGetDateTime(out var d) ? d : DateTime.UtcNow,
            };
        }

        // ── JSON helpers ──────────────────────────────────────────────────────

        private static string GetStr(JsonElement el, string key)
        {
            if (el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String)
                return v.GetString()?.Trim() ?? "";
            return "";
        }

        private static int? GetInt(JsonElement el, string key)
        {
            if (!el.TryGetProperty(key, out var v)) return null;
            if (v.ValueKind == JsonValueKind.Number && v.TryGetInt32(out var n)) return n;
            if (v.ValueKind == JsonValueKind.String && int.TryParse(v.GetString(), out n)) return n;
            return null;
        }

        /// <summary>Returns the first element of a JSON array field, or fallback.</summary>
        private static string ArrFirst(JsonElement el, string key, string fallback)
        {
            if (!el.TryGetProperty(key, out var v)) return fallback;
            if (v.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in v.EnumerateArray())
                    if (item.ValueKind == JsonValueKind.String)
                        return item.GetString() ?? fallback;
                return fallback;
            }
            if (v.ValueKind == JsonValueKind.String) return v.GetString() ?? fallback;
            return fallback;
        }

        /// <summary>
        /// Reads legacy Wix "Property Image" array — items may be objects with a "src" field
        /// or bare strings — and maps them to MediaItem with secureUrl resolved.
        /// </summary>
        private static List<MediaItem> GetRawImages(JsonElement el, string key)
        {
            if (!el.TryGetProperty(key, out var arr) || arr.ValueKind != JsonValueKind.Array)
                return new();

            var result = new List<MediaItem>();
            foreach (var item in arr.EnumerateArray())
            {
                string raw = "";
                string alt = "";

                if (item.ValueKind == JsonValueKind.String)
                {
                    raw = item.GetString() ?? "";
                }
                else if (item.ValueKind == JsonValueKind.Object)
                {
                    raw = item.TryGetProperty("src", out var s) ? s.GetString() ?? "" :
                          item.TryGetProperty("Slug", out var sl) ? sl.GetString() ?? "" :
                          item.TryGetProperty("slug", out var sl2) ? sl2.GetString() ?? "" : "";
                    alt = item.TryGetProperty("alt", out var a) ? a.GetString() ?? "" : "";
                }

                var url = ResolveWixUrl(raw);
                if (!string.IsNullOrWhiteSpace(url))
                    result.Add(new MediaItem { PublicId = "", SecureUrl = url, Alt = alt });
            }
            return result;
        }

        /// <summary>Reads new camelCase images/videos array — items are { publicId, secureUrl, alt }.</summary>
        private static List<MediaItem> GetMediaItems(JsonElement el, string key)
        {
            if (!el.TryGetProperty(key, out var arr) || arr.ValueKind != JsonValueKind.Array)
                return new();

            var result = new List<MediaItem>();
            foreach (var item in arr.EnumerateArray())
            {
                if (item.ValueKind != JsonValueKind.Object) continue;
                result.Add(new MediaItem
                {
                    PublicId = item.TryGetProperty("publicId", out var pid) ? pid.GetString() ?? "" : "",
                    SecureUrl = item.TryGetProperty("secureUrl", out var url) ? url.GetString() ?? "" : "",
                    Alt = item.TryGetProperty("alt", out var alt) ? alt.GetString() ?? "" : "",
                });
            }
            return result;
        }

        private static string? ResolveWixUrl(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            if (raw.StartsWith("http://") || raw.StartsWith("https://")) return raw;
            var m = System.Text.RegularExpressions.Regex.Match(raw, @"wix:image://v1/([^/]+)/");
            if (m.Success) return $"https://static.wixstatic.com/media/{m.Groups[1].Value}";
            if (!raw.Contains(':') && !raw.Contains('/'))
                return $"https://static.wixstatic.com/media/{raw}";
            return null;
        }

        private static decimal? ParsePrice(string label)
        {
            if (string.IsNullOrWhiteSpace(label)) return null;
            var m = System.Text.RegularExpressions.Regex.Match(label, @"([\d,.]+)\s*million", RegexOptions.IgnoreCase);
            if (m.Success && decimal.TryParse(m.Groups[1].Value.Replace(",", ""), out var n))
                return n * 1_000_000m;
            m = System.Text.RegularExpressions.Regex.Match(label, @"[\d,]+(\.\d+)?");
            if (m.Success && decimal.TryParse(m.Value.Replace(",", ""), out n)) return n;
            return null;
        }

        private static string? GetId(JsonElement el)
        {
            foreach (var key in new[] { "id", "ID" })
                if (el.TryGetProperty(key, out var v) && v.ValueKind == JsonValueKind.String)
                    return v.GetString();
            return null;
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

        private string GetManagedPath(string filename)
        {
            var dir = _config["DataPaths:Directory"]
                ?? System.IO.Path.Combine(AppContext.BaseDirectory, "data");
            return System.IO.Path.Combine(dir, filename);
        }

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

    // ── DTOs ──────────────────────────────────────────────────────────────────

    public class MediaItem
    {
        public string PublicId { get; set; } = string.Empty;
        public string SecureUrl { get; set; } = string.Empty;
        public string Alt { get; set; } = string.Empty;
    }

    public class PropertyDto
    {
        public string Id { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string ListingType { get; set; } = string.Empty;
        public string PropertyStatus { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public string FurnishingStatus { get; set; } = string.Empty;
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public string LotSize { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public string PricingLabel { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public string Amenities { get; set; } = string.Empty;
        public List<MediaItem> Images { get; set; } = new();
        public List<MediaItem> Videos { get; set; } = new();
        public DateTime CreatedDate { get; set; }
    }

    public class PropertyPageResult
    {
        public int Total { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int Pages { get; set; }
        public List<PropertyDto> Items { get; set; } = new();
    }
}