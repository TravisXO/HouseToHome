using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HouseToHome.Server.Controllers
{
    /// <summary>
    /// Handles Cloudinary uploads and deletes server-side so API credentials
    /// never leave the server.
    ///
    /// Reads credentials from appsettings.json using EITHER format:
    ///
    ///   Option A — URL format (what you already have):
    ///   "Cloudinary": { "Url": "cloudinary://API_KEY:API_SECRET@CLOUD_NAME" }
    ///
    ///   Option B — separate fields:
    ///   "Cloudinary": { "CloudName": "...", "ApiKey": "...", "ApiSecret": "..." }
    ///
    /// Optional:
    ///   "Cloudinary": { "Folder": "housetohome" }   ← defaults to "housetohome"
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class CloudinaryController : ControllerBase
    {
        private readonly string _cloudName;
        private readonly string _apiKey;
        private readonly string _apiSecret;
        private readonly string _folder;
        private readonly string _uploadPreset;
        private readonly IHttpClientFactory _http;
        private readonly ILogger<CloudinaryController> _logger;

        public CloudinaryController(
            IConfiguration config,
            IHttpClientFactory http,
            ILogger<CloudinaryController> logger)
        {
            _http = http;
            _logger = logger;

            var section = config.GetSection("Cloudinary");

            // ── Try URL format first: cloudinary://API_KEY:API_SECRET@CLOUD_NAME ──
            var url = section["Url"] ?? section["url"] ?? "";
            if (!string.IsNullOrWhiteSpace(url))
            {
                (_cloudName, _apiKey, _apiSecret) = ParseCloudinaryUrl(url);
            }
            else
            {
                // Fall back to separate fields
                _cloudName = section["CloudName"] ?? throw new InvalidOperationException(
                    "Cloudinary config missing. Add either Cloudinary:Url or Cloudinary:CloudName/ApiKey/ApiSecret to appsettings.json");
                _apiKey = section["ApiKey"] ?? throw new InvalidOperationException("Cloudinary:ApiKey not configured");
                _apiSecret = section["ApiSecret"] ?? throw new InvalidOperationException("Cloudinary:ApiSecret not configured");
            }

            _folder = section["Folder"] ?? "housetohome";
            _uploadPreset = section["UploadPreset"] ?? _folder;

            _logger.LogInformation("Cloudinary configured for cloud: {CloudName}", _cloudName);
        }

        // ── POST /api/cloudinary/upload ───────────────────────────────────────
        // Accepts multipart/form-data with a "file" field.
        // Uses the unsigned upload preset (set in appsettings Cloudinary:Folder).
        // Returns: { publicId, secureUrl, resourceType, width?, height? }
        [HttpPost("upload")]
        [RequestSizeLimit(100 * 1024 * 1024)] // 100 MB max
        [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
        public async Task<IActionResult> Upload(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file provided." });

            // Determine Cloudinary resource type from MIME
            var resourceType = file.ContentType.StartsWith("video/") ? "video" : "image";

            // Read file into memory
            byte[] fileBytes;
            await using (var stream = file.OpenReadStream())
            {
                fileBytes = new byte[file.Length];
                var totalRead = 0;
                while (totalRead < fileBytes.Length)
                {
                    var read = await stream.ReadAsync(fileBytes, totalRead, fileBytes.Length - totalRead);
                    if (read == 0) break;
                    totalRead += read;
                }
            }

            using var client = _http.CreateClient();
            client.Timeout = TimeSpan.FromMinutes(5);

            // Pass upload_preset as a query parameter — more reliable than multipart fields
            // because it bypasses any Content-Type header parsing issues on Cloudinary's side.
            var uploadUrl = $"https://api.cloudinary.com/v1_1/{_cloudName}/{resourceType}/upload?upload_preset={Uri.EscapeDataString(_uploadPreset)}";

            using var content = new MultipartFormDataContent();
            var filePart = new ByteArrayContent(fileBytes);
            filePart.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);
            content.Add(filePart, "file", file.FileName);

            _logger.LogInformation("Uploading {Name} ({Size} bytes) to Cloudinary as {Type}",
                file.FileName, file.Length, resourceType);

            HttpResponseMessage response;
            try
            {
                response = await client.PostAsync(uploadUrl, content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "HTTP error calling Cloudinary upload");
                return StatusCode(502, new { message = "Could not reach Cloudinary.", detail = ex.Message });
            }

            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Cloudinary upload rejected {Status}: {Body}", response.StatusCode, body);
                return StatusCode((int)response.StatusCode, new { message = "Cloudinary rejected the upload.", detail = body });
            }

            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            var publicId = root.TryGetProperty("public_id", out var pid) ? pid.GetString() ?? "" : "";
            var secureUrl = root.TryGetProperty("secure_url", out var surl) ? surl.GetString() ?? "" : "";
            int? width = root.TryGetProperty("width", out var w) && w.ValueKind == JsonValueKind.Number ? w.GetInt32() : null;
            int? height = root.TryGetProperty("height", out var h) && h.ValueKind == JsonValueKind.Number ? h.GetInt32() : null;

            _logger.LogInformation("Cloudinary upload OK → {PublicId}", publicId);

            return Ok(new { publicId, secureUrl, resourceType, width, height });
        }

        // ── DELETE /api/cloudinary ────────────────────────────────────────────
        // Body: { "publicId": "housetohome/abc123", "resourceType": "image" }
        [HttpDelete]
        public async Task<IActionResult> Delete([FromBody] DeleteRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.PublicId))
                return BadRequest(new { message = "publicId is required." });

            var resourceType = req.ResourceType ?? "image";
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
            var signParams = new SortedDictionary<string, string>
            {
                ["public_id"] = req.PublicId,
                ["timestamp"] = timestamp,
            };
            var signature = Sign(signParams);

            using var client = _http.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(30);

            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["public_id"] = req.PublicId,
                ["api_key"] = _apiKey,
                ["timestamp"] = timestamp,
                ["signature"] = signature,
            });

            var destroyUrl = $"https://api.cloudinary.com/v1_1/{_cloudName}/{resourceType}/destroy";

            HttpResponseMessage response;
            try
            {
                response = await client.PostAsync(destroyUrl, content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "HTTP error calling Cloudinary destroy");
                return StatusCode(502, new { message = "Could not reach Cloudinary.", detail = ex.Message });
            }

            var body = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Cloudinary delete rejected {Status}: {Body}", response.StatusCode, body);
                return StatusCode((int)response.StatusCode, new { message = "Cloudinary delete failed.", detail = body });
            }

            _logger.LogInformation("Cloudinary delete OK → {PublicId}", req.PublicId);
            return Ok(new { message = "Deleted.", publicId = req.PublicId });
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        /// <summary>
        /// Parses cloudinary://API_KEY:API_SECRET@CLOUD_NAME
        /// e.g. cloudinary://536744655354969:APS8ZmA7tS57BMEEK9tzt_cDNFc@dls9meup8
        /// </summary>
        private static (string cloudName, string apiKey, string apiSecret) ParseCloudinaryUrl(string url)
        {
            // Strip the scheme
            var withoutScheme = url.Replace("cloudinary://", "");

            // Split on @ to separate credentials from cloud name
            var atIdx = withoutScheme.LastIndexOf('@');
            if (atIdx < 0)
                throw new InvalidOperationException($"Invalid Cloudinary URL format: {url}");

            var cloudName = withoutScheme[(atIdx + 1)..].Trim();
            var credentials = withoutScheme[..atIdx];

            // Split credentials on first : to get key and secret
            var colonIdx = credentials.IndexOf(':');
            if (colonIdx < 0)
                throw new InvalidOperationException($"Invalid Cloudinary URL — missing colon in credentials: {url}");

            var apiKey = credentials[..colonIdx].Trim();
            var apiSecret = credentials[(colonIdx + 1)..].Trim();

            if (string.IsNullOrWhiteSpace(cloudName) ||
                string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(apiSecret))
                throw new InvalidOperationException($"Cloudinary URL parsed empty values from: {url}");

            return (cloudName, apiKey, apiSecret);
        }

        /// <summary>
        /// Generates a Cloudinary API signature.
        /// Sorted params as key=value&amp;... appended with API secret, SHA-1 hashed.
        /// </summary>
        private string Sign(SortedDictionary<string, string> parameters)
        {
            var paramStr = string.Join("&", parameters.Select(kv => $"{kv.Key}={kv.Value}"));
            var toSign = paramStr + _apiSecret;
            var bytes = SHA1.HashData(Encoding.UTF8.GetBytes(toSign));
            return Convert.ToHexString(bytes).ToLower();
        }

        public class DeleteRequest
        {
            public string PublicId { get; set; } = string.Empty;
            public string? ResourceType { get; set; } = "image";
        }
    }
}