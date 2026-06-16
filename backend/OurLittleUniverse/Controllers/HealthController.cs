using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;

    public HealthController(IConfiguration configuration, IWebHostEnvironment environment)
    {
        _configuration = configuration;
        _environment = environment;
    }

    [HttpGet]
    [ProducesResponseType(typeof(HealthResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthResponse> Get()
    {
        var response = new HealthResponse(
            _configuration["App:Name"] ?? "Arova.Api",
            "Healthy",
            _environment.EnvironmentName,
            DateTime.UtcNow);

        return Ok(response);
    }
}

public sealed record HealthResponse(
    string ApiName,
    string Status,
    string Environment,
    DateTime ServerTimeUtc);
