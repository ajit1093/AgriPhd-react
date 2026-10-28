using AgriPhd.Api.Extensions;
using AgriPhd.Api.Middleware;
using AgriPhd.Api.Models;
using Serilog;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;

// ─── Bootstrap Serilog early so startup errors are captured ────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting AgriPhd.Api...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Serilog (replaces default .NET logging) ─────────────────────────────
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .WriteTo.File(
                path: "Logs/app-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
            ));

    // ─── Configuration binding ────────────────────────────────────────────────
    builder.Services.Configure<AppSettings>(builder.Configuration.GetSection("AppSettings"));
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
    builder.Services.Configure<AzureBlobStorageSettings>(builder.Configuration.GetSection("AzureBlobStorage"));
    builder.Services.Configure<RazorpaySettings>(builder.Configuration.GetSection("Razorpay"));

    // ─── Database (Dapper + SqlConnection) ───────────────────────────────────
    // Only validate connection string exists; actual connection is lazy (opened per Dapper call)
    builder.Services.AddDapperSqlConnection(builder.Configuration);

    // ─── Caching (replaces Global.asax static master-data lists) ─────────────
    builder.Services.AddMemoryCache();

    // ─── HTTP Client factory (for Razorpay, MSG91, external API calls) ───────
    builder.Services.AddHttpClient();

    // ─── MVC controllers ──────────────────────────────────────────────────────
    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.DefaultIgnoreCondition =
                System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
        });

    // ─── API versioning + Swagger (P0-API-04, P0-API-05) ─────────────────────
    builder.Services.AddSwaggerWithVersioning();

    // ─── CORS — allow React dev server origin in development ─────────────────
    var reactOrigin = builder.Configuration["AppSettings:ReactAppOrigin"] ?? "http://localhost:5173";
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("ReactApp", policy =>
        {
            policy
                .WithOrigins(
                    reactOrigin,
                    "http://localhost:5173",
                    "https://localhost:5173"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
    });

    // ─── Authentication / JWT + DI registrations (P1-AUTH-01..07) ───────────
    builder.Services.AddAuthServices(builder.Configuration);
    builder.Services.AddAuthorization();

    // ─── Application repositories + services (modules added per phase) ────────
    builder.Services.AddApplicationServices();

    // ─── Rate limiting (P3-05) ────────────────────────────────────────────────
    builder.Services.AddApiRateLimiting();

    // ─────────────────────────────────────────────────────────────────────────
    var app = builder.Build();
    // ─────────────────────────────────────────────────────────────────────────

    // ─── Middleware pipeline (ORDER MATTERS) ──────────────────────────────────

    // 1. Security headers (earliest possible — applies to all responses including errors)
    app.UseMiddleware<SecurityHeadersMiddleware>();

    // 2. Global exception handler (wraps everything below)
    app.UseMiddleware<ExceptionMiddleware>();

    // 3. Request logging
    app.UseMiddleware<RequestLoggingMiddleware>();

    // 4. Swagger (development + staging only)
    if (!app.Environment.IsProduction())
    {
        app.UseSwaggerWithVersioning();
    }

    // 5. HTTPS redirect (production only)
    if (!app.Environment.IsDevelopment())
    {
        app.UseHttpsRedirection();
    }

    // 6. CORS (must be before Auth)
    app.UseCors("ReactApp");

    // 6b. CSRF double-submit cookie validation (P1-AUTH-07)
    app.UseMiddleware<CsrfMiddleware>();

    // 7. Routing + Auth (rate limiting must come AFTER UseRouting so endpoint metadata is resolved)
    app.UseRouting();
    app.UseAuthentication();
    app.UseAuthorization();

    // 7b. Rate limiting (P3-05) — MUST be after UseRouting + UseAuthentication
    app.UseRateLimiter();

    // 8. Serilog request enrichment
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000}ms";
    });

    // 9. Map controllers
    app.MapControllers();

    // Health check shortcut at root /health (no versioning required)
    app.MapGet("/health", () => Results.Ok(new { status = "ok", timestamp = DateTime.UtcNow }));

    Log.Information("AgriPhd.Api started. Swagger: /swagger | Health: /health");

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "AgriPhd.Api terminated unexpectedly");
    return 1;
}
finally
{
    Log.CloseAndFlush();
}

return 0;
