using System;
using System.Collections.Generic;
using HouseToHome.Server.Models;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HouseToHome.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "properties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ListingType = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    PropertyStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PropertyType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FurnishingStatus = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    AddressFormatted = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    AddressCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AddressCountry = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    Bedrooms = table.Column<int>(type: "integer", nullable: true),
                    Bathrooms = table.Column<int>(type: "integer", nullable: true),
                    LotSize = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Currency = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Price = table.Column<decimal>(type: "numeric", nullable: true),
                    PricingLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Amenities = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Images = table.Column<List<PropertyImage>>(type: "jsonb", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_properties", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_properties_Bathrooms",
                table: "properties",
                column: "Bathrooms");

            migrationBuilder.CreateIndex(
                name: "IX_properties_Bedrooms",
                table: "properties",
                column: "Bedrooms");

            migrationBuilder.CreateIndex(
                name: "IX_properties_Currency",
                table: "properties",
                column: "Currency");

            migrationBuilder.CreateIndex(
                name: "IX_properties_ListingType",
                table: "properties",
                column: "ListingType");

            migrationBuilder.CreateIndex(
                name: "IX_properties_ListingType_PropertyStatus",
                table: "properties",
                columns: new[] { "ListingType", "PropertyStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_properties_Location",
                table: "properties",
                column: "Location");

            migrationBuilder.CreateIndex(
                name: "IX_properties_Price",
                table: "properties",
                column: "Price");

            migrationBuilder.CreateIndex(
                name: "IX_properties_PropertyStatus",
                table: "properties",
                column: "PropertyStatus");

            migrationBuilder.CreateIndex(
                name: "IX_properties_PropertyType",
                table: "properties",
                column: "PropertyType");

            migrationBuilder.CreateIndex(
                name: "IX_properties_Slug",
                table: "properties",
                column: "Slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "properties");
        }
    }
}
