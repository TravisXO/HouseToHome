using System.Text.Json.Serialization;

namespace HouseToHome.Server.Models
{
    /// <summary>
    /// EF Core entity — maps to the "properties" table in Postgres.
    /// </summary>
    public class Property
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string AddressFormatted { get; set; } = string.Empty;
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string ListingType { get; set; } = string.Empty;   // "Rent" | "Sale"
        public string PropertyStatus { get; set; } = string.Empty;   // "Residential" | "Commercial" | etc.
        public string PropertyType { get; set; } = string.Empty;   // "House" | "Apartment" | etc.
        public string FurnishingStatus { get; set; } = string.Empty;
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public string LotSize { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;   // "$" | "K"
        public decimal? Price { get; set; }
        public string PricingLabel { get; set; } = string.Empty;   // display string e.g. "$1,500/month"
        public string Amenities { get; set; } = string.Empty;   // may contain HTML
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Stored as JSONB in Postgres — list of images with resolved HTTPS URLs.
        /// After migration these will be Cloudinary URLs.
        /// </summary>
        public List<PropertyImage> Images { get; set; } = new();
    }

    /// <summary>
    /// Stored inside Property.Images (JSONB column).
    /// After Cloudinary migration, Src and Slug will both be full HTTPS URLs.
    /// </summary>
    public class PropertyImage
    {
        [JsonPropertyName("src")]
        public string Src { get; set; } = string.Empty;

        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("alt")]
        public string Alt { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;

        [JsonPropertyName("width")]
        public int? Width { get; set; }

        [JsonPropertyName("height")]
        public int? Height { get; set; }
    }
}