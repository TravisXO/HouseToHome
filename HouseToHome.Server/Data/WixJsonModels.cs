using System.Text.Json;
using System.Text.Json.Serialization;

namespace HouseToHome.Server.Data
{
    // ── Custom Converters ─────────────────────────────────────────────────

    /// <summary>
    /// Handles Wix JSON fields that are sometimes a bare string, sometimes a string array.
    /// e.g. "Listing Type": "Rent"  OR  ["Rent"]
    /// </summary>
    public class FlexibleStringListConverter : JsonConverter<List<string>>
    {
        public override List<string> Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.String => new List<string> { reader.GetString() ?? string.Empty },
                JsonTokenType.StartArray => ReadArray(ref reader),
                JsonTokenType.Null => new List<string>(),
                _ => new List<string>()
            };
        }

        private static List<string> ReadArray(ref Utf8JsonReader reader)
        {
            var list = new List<string>();
            while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
                if (reader.TokenType == JsonTokenType.String)
                    list.Add(reader.GetString() ?? string.Empty);
            return list;
        }

        public override void Write(Utf8JsonWriter writer, List<string> value, JsonSerializerOptions options)
        {
            writer.WriteStartArray();
            foreach (var s in value) writer.WriteStringValue(s);
            writer.WriteEndArray();
        }
    }

    /// <summary>
    /// Handles fields that are sometimes a number, sometimes a numeric string, sometimes empty string.
    /// e.g. "Bedrooms": 2  OR  "Bedrooms": "2"  OR  "Bedrooms": ""
    /// </summary>
    public class FlexibleNullableIntConverter : JsonConverter<int?>
    {
        public override int? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Number => reader.TryGetInt32(out var n) ? n : null,
                JsonTokenType.String => int.TryParse(reader.GetString(), out var s) ? s : null,
                JsonTokenType.Null => null,
                _ => null
            };
        }

        public override void Write(Utf8JsonWriter writer, int? value, JsonSerializerOptions options)
        {
            if (value.HasValue) writer.WriteNumberValue(value.Value);
            else writer.WriteNullValue();
        }
    }

    // ── Top-level array element ───────────────────────────────────────────
    public class WixProperty
    {
        [JsonPropertyName("Title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("Location")]
        public string Location { get; set; } = string.Empty;

        [JsonPropertyName("Property Image")]
        public List<WixImage> PropertyImages { get; set; } = new();

        [JsonPropertyName("Listing Type")]
        [JsonConverter(typeof(FlexibleStringListConverter))]
        public List<string> ListingType { get; set; } = new();

        // Note: "Propety Status" is a typo in the source data — preserved exactly
        [JsonPropertyName("Propety Status")]
        [JsonConverter(typeof(FlexibleStringListConverter))]
        public List<string> PropertyStatus { get; set; } = new();

        [JsonPropertyName("Property Type")]
        [JsonConverter(typeof(FlexibleStringListConverter))]
        public List<string> PropertyType { get; set; } = new();

        // Furnishing Status intentionally omitted — column will be left empty

        [JsonPropertyName("Bedrooms")]
        [JsonConverter(typeof(FlexibleNullableIntConverter))]
        public int? Bedrooms { get; set; }

        // Note: "Bathroom" is singular in source data
        [JsonPropertyName("Bathroom")]
        [JsonConverter(typeof(FlexibleNullableIntConverter))]
        public int? Bathroom { get; set; }

        [JsonPropertyName("Lot Size")]
        public string LotSize { get; set; } = string.Empty;

        // Note: value is "$" or "K", not "USD" / "ZMW"
        [JsonPropertyName("Currency")]
        [JsonConverter(typeof(FlexibleStringListConverter))]
        public List<string> Currency { get; set; } = new();

        [JsonPropertyName("Pricing")]
        public string Pricing { get; set; } = string.Empty;

        // Address intentionally omitted — too inconsistent in source data, columns left empty

        // Note: "Ammenities" is a typo in the source data — preserved exactly
        [JsonPropertyName("Ammenities")]
        public string Amenities { get; set; } = string.Empty;

        [JsonPropertyName("ID")]
        public string Id { get; set; } = string.Empty;
    }

    public class WixImage
    {
        [JsonPropertyName("slug")]
        public string Slug { get; set; } = string.Empty;

        [JsonPropertyName("alt")]
        public string Alt { get; set; } = string.Empty;

        [JsonPropertyName("settings")]
        public WixImageSettings? Settings { get; set; }
    }

    public class WixImageSettings
    {
        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }
    }
}