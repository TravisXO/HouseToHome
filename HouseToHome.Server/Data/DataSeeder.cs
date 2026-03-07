using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using HouseToHome.Server.Models;

namespace HouseToHome.Server.Data
{
    public static class DataSeeder
    {
        private const string WixCdnBase = "https://static.wixstatic.com/media/";

        public static async Task SeedAsync(AppDbContext db, ILogger? logger = null)
        {
            if (db.Properties.Any())
            {
                logger?.LogInformation("DataSeeder: table already has data — skipping.");
                return;
            }

            var jsonPath = FindJsonFile("all-properties.json");
            if (jsonPath == null)
            {
                logger?.LogWarning("DataSeeder: all-properties.json not found — skipping seed.");
                return;
            }

            logger?.LogInformation("DataSeeder: loading {Path}", jsonPath);

            await using var stream = File.OpenRead(jsonPath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = false,
                AllowTrailingCommas = true,
                ReadCommentHandling = JsonCommentHandling.Skip,
            };

            var wixItems = await JsonSerializer.DeserializeAsync<List<WixProperty>>(stream, options);
            if (wixItems == null || wixItems.Count == 0)
            {
                logger?.LogWarning("DataSeeder: JSON deserialized to empty list — nothing to seed.");
                return;
            }

            var slugTracker = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var properties = new List<Property>();

            foreach (var w in wixItems)
            {
                if (string.IsNullOrWhiteSpace(w.Title)) continue;

                var title = w.Title.Trim();
                // Truncate to respect [MaxLength(500)] on the Title column
                if (title.Length > 500) title = title[..500];

                var pricingLabel = (w.Pricing ?? string.Empty).Trim();
                // Truncate to respect [MaxLength(200)] on the PricingLabel column
                if (pricingLabel.Length > 200) pricingLabel = pricingLabel[..200];

                var location = (w.Location ?? string.Empty).Trim();
                // Truncate to respect [MaxLength(150)] on the Location column
                if (location.Length > 150) location = location[..150];

                var property = new Property
                {
                    Id = Guid.NewGuid(),
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow,

                    Title = title,
                    ListingType = MapListingType(w.ListingType),
                    PropertyStatus = MapFirst(w.PropertyStatus, "Residential"),
                    PropertyType = MapFirst(w.PropertyType, "House"),
                    FurnishingStatus = string.Empty,

                    Location = location,
                    AddressFormatted = string.Empty,
                    AddressCity = "Lusaka",
                    AddressCountry = "ZM",
                    Latitude = null,
                    Longitude = null,

                    Bedrooms = w.Bedrooms,
                    Bathrooms = w.Bathroom,
                    LotSize = (w.LotSize ?? string.Empty).Trim(),

                    Currency = MapCurrency(w.Currency),
                    Price = ExtractNumericPrice(w.Pricing),
                    PricingLabel = pricingLabel,

                    Amenities = (w.Amenities ?? string.Empty).Trim(),
                    Slug = GenerateUniqueSlug(title, slugTracker),

                    Images = MapImages(w.PropertyImages),
                };

                properties.Add(property);
            }

            db.Properties.AddRange(properties);
            await db.SaveChangesAsync();

            logger?.LogInformation("DataSeeder: inserted {Count} properties.", properties.Count);
        }

        private static string MapListingType(List<string> values)
        {
            var raw = (values?.FirstOrDefault() ?? "Rent").Trim();
            return raw.Equals("Sale", StringComparison.OrdinalIgnoreCase) ? "Buy" : raw;
        }

        private static string MapFirst(List<string>? values, string fallback)
            => values?.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v))?.Trim() ?? fallback;

        private static string MapCurrency(List<string>? values)
        {
            var raw = (values?.FirstOrDefault() ?? "$").Trim();
            return raw switch
            {
                "$" => "USD",
                "K" => "ZMW",
                "USD" => "USD",
                "ZMW" => "ZMW",
                _ => "USD",
            };
        }

        private static decimal? ExtractNumericPrice(string? pricing)
        {
            if (string.IsNullOrWhiteSpace(pricing)) return null;
            var cleaned = pricing.Replace(",", "").Replace("$", "").Replace("K", "");
            var match = Regex.Match(cleaned, @"\d+(\.\d+)?");
            if (match.Success && decimal.TryParse(match.Value, out var result))
                return result;
            return null;
        }

        private static List<PropertyImage> MapImages(List<WixImage>? wixImages)
        {
            if (wixImages == null) return new();

            return wixImages
                .Where(i => !string.IsNullOrWhiteSpace(i.Slug))
                .Select(i => new PropertyImage
                {
                    Slug = WixCdnBase + i.Slug,
                    Alt = i.Alt ?? string.Empty,
                    Width = i.Settings?.Width ?? 0,
                    Height = i.Settings?.Height ?? 0,
                })
                .ToList();
        }

        private static string GenerateUniqueSlug(string title, HashSet<string> tracker)
        {
            var baseSlug = ToSlug(title);
            if (baseSlug.Length > 240) baseSlug = baseSlug[..240];

            var slug = baseSlug;
            var counter = 2;
            while (!tracker.Add(slug))
                slug = $"{baseSlug}-{counter++}";

            return slug;
        }

        private static string ToSlug(string text)
        {
            var normalised = text.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var c in normalised)
            {
                var cat = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (cat == System.Globalization.UnicodeCategory.NonSpacingMark) continue;
                sb.Append(char.ToLowerInvariant(c));
            }
            var slug = Regex.Replace(sb.ToString(), @"[^a-z0-9]+", "-");
            return slug.Trim('-');
        }

        private static string? FindJsonFile(string filename)
        {
            var dir = AppContext.BaseDirectory;
            for (var i = 0; i < 6; i++)
            {
                var candidate = Path.Combine(dir, "src", "data", filename);
                if (File.Exists(candidate)) return candidate;

                candidate = Path.Combine(dir, filename);
                if (File.Exists(candidate)) return candidate;

                try
                {
                    foreach (var clientDir in Directory.GetDirectories(dir, "*client*", SearchOption.TopDirectoryOnly))
                    {
                        candidate = Path.Combine(clientDir, "src", "data", filename);
                        if (File.Exists(candidate)) return candidate;
                    }
                }
                catch (UnauthorizedAccessException) { }

                var parent = Directory.GetParent(dir)?.FullName;
                if (parent == null) break;
                dir = parent;
            }
            return null;
        }
    }
}