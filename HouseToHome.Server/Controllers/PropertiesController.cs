using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HouseToHome.Server.Data;
using HouseToHome.Server.Models;

namespace HouseToHome.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertiesController : ControllerBase
    {
        private readonly AppDbContext _db;
        public PropertiesController(AppDbContext db) => _db = db;

        // ── GET /api/properties ───────────────────────────────────────
        // Supports all Hero.jsx search filters:
        //   listingType    = "Rent" | "Buy"
        //   propertyStatus = "Residential" | "Commercial" | "Land" | "Investment"
        //   propertyType   = "House" | "Apartment" | "Townhouse" | etc.
        //   currency       = "USD" | "ZMW"
        //   minPrice       = decimal
        //   maxPrice       = decimal
        //   bedrooms       = 1..5  (returns >= this value)
        //   bathrooms      = 1..5  (returns >= this value)
        //   q              = free-text search on Title + Location
        //   page / pageSize
        [HttpGet]
        public async Task<ActionResult<PropertyPageResult>> GetAll(
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
            var query = _db.Properties.AsQueryable();

            if (!string.IsNullOrWhiteSpace(listingType))
                query = query.Where(p => p.ListingType == listingType);

            if (!string.IsNullOrWhiteSpace(propertyStatus))
                query = query.Where(p => p.PropertyStatus == propertyStatus);

            if (!string.IsNullOrWhiteSpace(propertyType))
                query = query.Where(p => p.PropertyType == propertyType);

            if (!string.IsNullOrWhiteSpace(currency))
                query = query.Where(p => p.Currency == currency);

            if (minPrice.HasValue)
                query = query.Where(p => p.Price >= minPrice.Value);

            if (maxPrice.HasValue)
                query = query.Where(p => p.Price <= maxPrice.Value);

            // "2+" means Bedrooms >= 2
            if (bedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= bedrooms.Value);

            if (bathrooms.HasValue)
                query = query.Where(p => p.Bathrooms >= bathrooms.Value);

            if (!string.IsNullOrWhiteSpace(q))
            {
                var term = q.ToLower();
                query = query.Where(p =>
                    p.Title.ToLower().Contains(term) ||
                    p.Location.ToLower().Contains(term) ||
                    p.AddressFormatted.ToLower().Contains(term));
            }

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.CreatedDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Slug = p.Slug,
                    ListingType = p.ListingType,
                    PropertyStatus = p.PropertyStatus,
                    PropertyType = p.PropertyType,
                    FurnishingStatus = p.FurnishingStatus,
                    Location = p.Location,
                    AddressFormatted = p.AddressFormatted,
                    Bedrooms = p.Bedrooms,
                    Bathrooms = p.Bathrooms,
                    LotSize = p.LotSize,
                    Currency = p.Currency,
                    Price = p.Price,
                    PricingLabel = p.PricingLabel,
                    Images = p.Images,
                    CreatedDate = p.CreatedDate,
                })
                .ToListAsync();

            return Ok(new PropertyPageResult
            {
                Total = total,
                Page = page,
                PageSize = pageSize,
                Pages = (int)Math.Ceiling((double)total / pageSize),
                Items = items,
            });
        }

        // ── GET /api/properties/{slug} ────────────────────────────────
        [HttpGet("{slug}")]
        public async Task<ActionResult<Property>> GetBySlug(string slug)
        {
            var property = await _db.Properties
                .FirstOrDefaultAsync(p => p.Slug == slug);

            if (property == null) return NotFound();
            return Ok(property);
        }
    }

    // ── DTOs ──────────────────────────────────────────────────────────

    public class PropertyDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string ListingType { get; set; } = string.Empty;
        public string PropertyStatus { get; set; } = string.Empty;
        public string PropertyType { get; set; } = string.Empty;
        public string FurnishingStatus { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string AddressFormatted { get; set; } = string.Empty;
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public string LotSize { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public decimal? Price { get; set; }
        public string PricingLabel { get; set; } = string.Empty;
        public List<PropertyImage> Images { get; set; } = new();
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