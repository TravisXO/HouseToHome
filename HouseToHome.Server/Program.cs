using HouseToHome.Server.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// ── Services ──────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient(); // Required by CloudinaryController

// ── Validate connection string early so the error is obvious ──────────────
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Connection string 'DefaultConnection' is missing or empty.\n" +
        "Add it to appsettings.Development.json or use dotnet user-secrets:\n" +
        "  dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" " +
        "\"Host=localhost;Port=5432;Database=housetohome;Username=postgres;Password=yourpassword\"");
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        new NpgsqlDataSourceBuilder(connectionString)
            .EnableDynamicJson()
            .Build()
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ViteDev", policy =>
        policy.WithOrigins("https://localhost:5173", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// ── Auto-migrate + seed on every startup ─────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    await db.Database.MigrateAsync();
    await DataSeeder.SeedAsync(db, logger);   // reads all-properties.json; no-ops if table has data
}

// ── Pipeline ──────────────────────────────────────────────────────────
app.UseCors("ViteDev");
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();