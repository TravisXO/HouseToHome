using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using HouseToHome.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseToHome.Server.Data
{
    public static class DataSeeder
    {
        // ── JSON deserialization options ──────────────────────────────────────
        private static readonly JsonSerializerOptions JsonOpts = new()
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        };

        // ── Entry point ───────────────────────────────────────────────────────
        public static async Task SeedAsync(AppDbContext db, ILogger logger)
        {
            // No-op if already seeded
            if (await db.Properties.AnyAsync())
            {
                logger.LogInformation("DataSeeder: table already has data — skipping.");
                return;
            }

            var path = FindJsonFile("all-properties.json");
            if (path == null)
            {
                logger.LogWarning("DataSeeder: all-properties.json not found — no data seeded.");
                return;
            }

            logger.LogInformation("DataSeeder: seeding from {Path}", path);

            var json = await File.ReadAllTextAsync(path);
            var raw = JsonSerializer.Deserialize<List<RawProperty>>(json, JsonOpts);
            if (raw == null || raw.Count == 0)
            {
                logger.LogWarning("DataSeeder: JSON parsed but contained 0 records.");
                return;
            }

            var properties = raw
                .Select((r, i) => MapToProperty(r, i))
                .Where(p => p != null)
                .Cast<Property>()
                .ToList();

            await db.Properties.AddRangeAsync(properties);
            await db.SaveChangesAsync();

            logger.LogInformation("DataSeeder: seeded {Count} properties.", properties.Count);
        }

        // ── Map raw JSON → Property entity ───────────────────────────────────
        private static Property? MapToProperty(RawProperty r, int index)
        {
            var title = r.Title?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(title)) return null;

            // Use provided ID or generate a stable one from title + index
            var rawId = r.ID?.Trim();
            var hasGuid = Guid.TryParse(rawId, out var parsedGuid);
            var id = hasGuid ? parsedGuid : Guid.NewGuid();

            // Slug: from property or derived from title
            var slug = string.IsNullOrWhiteSpace(r.Slug)
                ? Slugify(title) + "-" + (index + 1)
                : r.Slug.Trim();

            // Listing type — normalise "Buy" → "Sale" for consistency
            var listingType = FirstValue(r.ListingType) ?? "Rent";
            if (listingType.Equals("Buy", StringComparison.OrdinalIgnoreCase)) listingType = "Sale";

            // Currency — normalise "ZMW" → "K"
            var currency = FirstValue(r.Currency) ?? "$";
            if (currency.Equals("ZMW", StringComparison.OrdinalIgnoreCase)) currency = "K";

            // Price — try to parse a numeric value from the pricing label
            var pricingLabel = r.Pricing?.Trim() ?? string.Empty;
            decimal? price = ParsePrice(pricingLabel);

            // Images — support both old Wix slug format and new Cloudinary URL format
            var images = (r.PropertyImage ?? new List<RawImage>())
                .Select(img => new PropertyImage
                {
                    Src = ResolveImageUrl(img.Src, img.Slug ?? img.SlugAlt),
                    Slug = ResolveImageUrl(img.Slug ?? img.SlugAlt, null),
                    Alt = img.Alt ?? string.Empty,
                    Description = img.Description ?? string.Empty,
                    Title = img.Title ?? string.Empty,
                    Width = img.Settings?.Width,
                    Height = img.Settings?.Height,
                })
                .Where(img => !string.IsNullOrWhiteSpace(img.Src))
                .ToList();

            return new Property
            {
                Id = id,
                Slug = slug,
                Title = title,
                Location = r.Location?.Trim() ?? string.Empty,
                ListingType = listingType,
                PropertyStatus = FirstValue(r.PropertyStatus) ?? "Residential",
                PropertyType = FirstValue(r.PropertyType) ?? "House",
                FurnishingStatus = FirstValue(r.FurnishingStatus) ?? string.Empty,
                Bedrooms = r.Bedrooms,
                Bathrooms = r.Bathroom,
                LotSize = r.LotSize?.Trim() ?? string.Empty,
                Currency = currency,
                Price = price,
                PricingLabel = pricingLabel,
                Amenities = r.Amenities?.Trim() ?? string.Empty,
                AddressFormatted = r.Address?.Formatted ?? r.Location?.Trim() ?? string.Empty,
                Latitude = r.Address?.Location?.Latitude,
                Longitude = r.Address?.Location?.Longitude,
                Images = images,
                CreatedDate = DateTime.UtcNow,
            };
        }

        // ── Image URL resolution ──────────────────────────────────────────────
        // Handles three cases:
        //   1. Already a Cloudinary / HTTPS URL  → return as-is
        //   2. wix:image://v1/<slug>/...          → build Wix CDN URL (legacy fallback)
        //   3. Plain slug (a610ee_...~mv2.jpg)    → build Wix CDN URL (legacy fallback)
        private static string ResolveImageUrl(string? primary, string? fallbackSlug)
        {
            var val = primary?.Trim() ?? fallbackSlug?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(val)) return string.Empty;

            // Already a clean HTTPS URL (Cloudinary or other CDN)
            if (val.StartsWith("https://") || val.StartsWith("http://"))
                return val;

            // Wix image URI scheme → extract slug and build CDN URL
            var wixMatch = Regex.Match(val, @"wix:image://v1/([^/]+)/");
            if (wixMatch.Success)
                return $"https://static.wixstatic.com/media/{wixMatch.Groups[1].Value}";

            // Plain slug
            if (!val.Contains('/') && !val.Contains(':'))
                return $"https://static.wixstatic.com/media/{val}";

            return val;
        }

        // ── Price parsing ─────────────────────────────────────────────────────
        // Extracts a numeric price from strings like "$1,500/month", "K2.1 million", "$1,700"
        private static decimal? ParsePrice(string label)
        {
            if (string.IsNullOrWhiteSpace(label)) return null;

            // Handle "X million" / "X.X million"
            var millionMatch = Regex.Match(label, @"([\d,.]+)\s*million", RegexOptions.IgnoreCase);
            if (millionMatch.Success && decimal.TryParse(
                    millionMatch.Groups[1].Value.Replace(",", ""),
                    out var millions))
                return millions * 1_000_000m;

            // Extract first numeric sequence (digits, commas, dots)
            var numMatch = Regex.Match(label, @"[\d,]+(\.\d+)?");
            if (numMatch.Success && decimal.TryParse(
                    numMatch.Value.Replace(",", ""),
                    System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture,
                    out var price))
                return price;

            return null;
        }

        // ── Slug generation ───────────────────────────────────────────────────
        private static string Slugify(string text)
        {
            var slug = text.ToLowerInvariant();
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            slug = Regex.Replace(slug, @"\s+", "-");
            slug = Regex.Replace(slug, @"-+", "-").Trim('-');
            return slug.Length > 80 ? slug[..80] : slug;
        }

        // ── Helper: first element of a string array or null ───────────────────
        private static string? FirstValue(List<string>? list) =>
            list?.FirstOrDefault(s => !string.IsNullOrWhiteSpace(s))?.Trim();

        // ── File finder (mirrors AdminController logic) ───────────────────────
        private static string? FindJsonFile(string filename)
        {
            // Prefer all-current-properties.json (admin-edited) over original
            var candidates = new[] { "all-current-properties.json", filename };

            var dir = AppContext.BaseDirectory;
            for (var i = 0; i < 6; i++)
            {
                foreach (var candidate in candidates)
                {
                    var path = Path.Combine(dir, "src", "data", candidate);
                    if (File.Exists(path)) return path;

                    path = Path.Combine(dir, candidate);
                    if (File.Exists(path)) return path;

                    try
                    {
                        foreach (var clientDir in Directory.GetDirectories(dir, "*client*", SearchOption.TopDirectoryOnly))
                        {
                            path = Path.Combine(clientDir, "src", "data", candidate);
                            if (File.Exists(path)) return path;
                        }
                    }
                    catch (UnauthorizedAccessException) { }
                }

                var parent = Directory.GetParent(dir)?.FullName;
                if (parent == null) break;
                dir = parent;
            }
            return null;
        }
    }

    // ── Raw JSON shape (matches both old Wix export and new Cloudinary JSON) ──
    internal class RawProperty
    {
        [JsonPropertyName("ID")]
        public string? ID { get; set; }

        [JsonPropertyName("Slug")]
        public string? Slug { get; set; }

        [JsonPropertyName("Title")]
        public string? Title { get; set; }

        [JsonPropertyName("Location")]
        public string? Location { get; set; }

        [JsonPropertyName("Listing Type")]
        public List<string>? ListingType { get; set; }

        [JsonPropertyName("Propety Status")]   // original Wix typo preserved
        public List<string>? PropertyStatus { get; set; }

        [JsonPropertyName("Property Type")]
        public List<string>? PropertyType { get; set; }

        [JsonPropertyName("Furnishing Status")]
        public List<string>? FurnishingStatus { get; set; }

        [JsonPropertyName("Bedrooms")]
        public int? Bedrooms { get; set; }

        [JsonPropertyName("Bathroom")]
        public int? Bathroom { get; set; }

        [JsonPropertyName("Lot Size")]
        public string? LotSize { get; set; }

        [JsonPropertyName("Currency")]
        public List<string>? Currency { get; set; }

        [JsonPropertyName("Pricing")]
        public string? Pricing { get; set; }

        [JsonPropertyName("Ammenities")]       // original Wix typo preserved
        public string? Amenities { get; set; }

        [JsonPropertyName("Property Image")]
        public List<RawImage>? PropertyImage { get; set; }

        [JsonPropertyName("Address")]
        public RawAddress? Address { get; set; }
    }

    internal class RawImage
    {
        [JsonPropertyName("slug")]
        public string? Slug { get; set; }

        // Some entries use capital Slug after migration
        [JsonPropertyName("Slug")]
        public string? SlugAlt { get; set; }

        [JsonPropertyName("src")]
        public string? Src { get; set; }

        [JsonPropertyName("alt")]
        public string? Alt { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("settings")]
        public RawImageSettings? Settings { get; set; }
    }

    internal class RawImageSettings
    {
        [JsonPropertyName("width")]
        public int? Width { get; set; }

        [JsonPropertyName("height")]
        public int? Height { get; set; }
    }

    internal class RawAddress
    {
        [JsonPropertyName("formatted")]
        public string? Formatted { get; set; }

        [JsonPropertyName("location")]
        public RawLatLng? Location { get; set; }
    }

    internal class RawLatLng
    {
        [JsonPropertyName("latitude")]
        public double? Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public double? Longitude { get; set; }
    }
}