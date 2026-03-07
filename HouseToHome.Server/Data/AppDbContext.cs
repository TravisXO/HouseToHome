using Microsoft.EntityFrameworkCore;
using HouseToHome.Server.Models;

namespace HouseToHome.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Property> Properties => Set<Property>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Property>(e =>
            {
                e.ToTable("properties");
                e.HasKey(p => p.Id);
                e.HasIndex(p => p.Slug).IsUnique();
                e.HasIndex(p => p.ListingType);
                e.HasIndex(p => p.PropertyStatus);
                e.HasIndex(p => p.PropertyType);
                e.HasIndex(p => p.Location);
                e.HasIndex(p => p.Currency);
                e.HasIndex(p => p.Price);
                e.HasIndex(p => p.Bedrooms);
                e.HasIndex(p => p.Bathrooms);
                e.HasIndex(p => new { p.ListingType, p.PropertyStatus });
                e.Property(p => p.Images).HasColumnType("jsonb");
            });
        }
    }
}