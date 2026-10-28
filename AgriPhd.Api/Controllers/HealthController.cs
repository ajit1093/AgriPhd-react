using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Simple health check endpoint used by the React app on startup to verify API connectivity.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ILogger<HealthController> _logger;

    public HealthController(ILogger<HealthController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Returns 200 OK with current timestamp. Used by React dev server and monitoring.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public IActionResult Get()
    {
        _logger.LogInformation("Health check called");
        return Ok(new HealthResponse
        {
            Status = "ok",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production",
            Version = "1.0"
        });
    }
}

public record HealthResponse(string Status, DateTime Timestamp, string Environment, string Version)
{
    // Parameterless constructor needed for JSON serialization
    public HealthResponse() : this(string.Empty, DateTime.UtcNow, string.Empty, string.Empty) { }
}
