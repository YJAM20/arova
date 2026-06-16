using LoveUniverse.Api.DTOs.Planets;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/planets")]
public sealed class PlanetsController : ControllerBase
{
    private readonly IPlanetService _planetService;

    public PlanetsController(IPlanetService planetService)
    {
        _planetService = planetService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PlanetResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PlanetResponse>>> GetPlanets(CancellationToken cancellationToken)
    {
        var result = await _planetService.GetPlanetsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("today")]
    [ProducesResponseType(typeof(DailyPlanetResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyPlanetResponse>> GetTodayPlanet(CancellationToken cancellationToken)
    {
        var result = await _planetService.GetTodayPlanetAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("today/roll")]
    [ProducesResponseType(typeof(DailyPlanetResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyPlanetResponse>> RollTodayPlanet(CancellationToken cancellationToken)
    {
        var result = await _planetService.RollTodayPlanetAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("tasks/complete")]
    [ProducesResponseType(typeof(DailyPlanetResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyPlanetResponse>> CompleteTask(
        CompleteTaskRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _planetService.CompleteTaskAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    private ActionResult ToActionResult<T>(
        ContentServiceResult<T> result,
        Func<T, ActionResult> onSuccess)
    {
        if (result.Status == ContentServiceStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        var error = new { message = result.ErrorMessage ?? "The request could not be completed." };
        return result.Status switch
        {
            ContentServiceStatus.BadRequest => BadRequest(error),
            ContentServiceStatus.Unauthorized => Unauthorized(error),
            ContentServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, error),
            ContentServiceStatus.NotFound => NotFound(error),
            _ => BadRequest(error)
        };
    }
}
