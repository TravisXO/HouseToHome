using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HouseToHome.Server.Models
{
    /// <summary>
    /// ListingType + PropertyStatus → nav route:
    ///   Rent  + Residential  →  /residential-rent
    ///   Rent  + Commercial   →  /commercial-rent
    ///   Buy   + Residential  →  /residential-sale
    ///   Buy   + Land         →  /land-sale
    ///   Buy   + Commercial   →  /commercial-sale
    ///   Buy   + Investment   →  /investments
    /// </summary>
    public class Property
    {
        // ── Identity ─────────────────────────────────────────────────
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedDate { get; set; } = DateTime.UtcNow;

        // ── Core ─────────────────────────────────────────────────────
        [Required, MaxLength(500)]
        public string Title { get; set; } = string.Empty;

        /// <summary>"Rent" | "Buy"</summary>
        [Required, MaxLength(10)]
        public string ListingType { get; set; } = string.Empty;

        /// <summary>"Residential" | "Commercial" | "Land" | "Investment"</summary>
        [Required, MaxLength(50)]
        public string PropertyStatus { get; set; } = string.Empty;

        /// <summary>"House" | "Apartment" | "Townhouse" | "Vacant Land" | "Farm" | "Commercial" | "Industrial"</summary>
        [Required, MaxLength(100)]
        public string PropertyType { get; set; } = string.Empty;

        /// <summary>"Furnished" | "Unfurnished" | "Semi-Furnished" | ""</summary>
        [MaxLength(50)]
        public string FurnishingStatus { get; set; } = string.Empty;

        // ── Location ─────────────────────────────────────────────────
        /// <summary>Neighbourhood e.g. "New Kasama", "Kabulonga"</summary>
        [Required, MaxLength(150)]
        public string Location { get; set; } = string.Empty;

        /// <summary>Full display address e.g. "New Kasama, Lusaka, Zambia"</summary>
        [MaxLength(300)]
        public string AddressFormatted { get; set; } = string.Empty;

        [MaxLength(100)]
        public string AddressCity { get; set; } = "Lusaka";

        [MaxLength(5)]
        public string AddressCountry { get; set; } = "ZM";

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // ── Property Details ─────────────────────────────────────────
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }

        /// <summary>e.g. "450 sqm", "0.5 acres", "" for apartments</summary>
        [MaxLength(100)]
        public string LotSize { get; set; } = string.Empty;

        // ── Pricing ──────────────────────────────────────────────────
        /// <summary>"USD" | "ZMW"</summary>
        [Required, MaxLength(5)]
        public string Currency { get; set; } = "USD";

        /// <summary>Numeric value used for min/max price filtering</summary>
        public decimal? Price { get; set; }

        /// <summary>Display label e.g. "$1,100 / month" or "K 15,000"</summary>
        [MaxLength(200)]
        public string PricingLabel { get; set; } = string.Empty;

        // ── Content ──────────────────────────────────────────────────
        /// <summary>HTML amenities list (from Wix source)</summary>
        public string Amenities { get; set; } = string.Empty;

        /// <summary>URL slug e.g. "two-bedroom-apartment-new-kasama"</summary>
        [Required, MaxLength(250)]
        public string Slug { get; set; } = string.Empty;

        // ── Images (JSONB) ───────────────────────────────────────────
        [Column(TypeName = "jsonb")]
        public List<PropertyImage> Images { get; set; } = new();
    }

    public class PropertyImage
    {
        public string Slug { get; set; } = string.Empty;
        public string Alt { get; set; } = string.Empty;
        public int Width { get; set; }
        public int Height { get; set; }
    }
}