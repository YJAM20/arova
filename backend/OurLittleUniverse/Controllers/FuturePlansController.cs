using LoveUniverse.Api.DTOs.FuturePlans;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/future-plans")]
public sealed class FuturePlansController : ControllerBase
{
    private readonly IFuturePlanService _futurePlanService;

    public FuturePlansController(IFuturePlanService futurePlanService)
    {
        _futurePlanService = futurePlanService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<FuturePlanResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<FuturePlanResponse>>> GetFuturePlans(CancellationToken cancellationToken)
    {
        var result = await _futurePlanService.GetFuturePlansAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(FuturePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FuturePlanResponse>> GetFuturePlan(Guid id, CancellationToken cancellationToken)
    {
        var result = await _futurePlanService.GetFuturePlanAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(FuturePlanResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<FuturePlanResponse>> CreateFuturePlan(
        FuturePlanCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _futurePlanService.CreateFuturePlanAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetFuturePlan), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(FuturePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FuturePlanResponse>> UpdateFuturePlan(
        Guid id,
        FuturePlanUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _futurePlanService.UpdateFuturePlanAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteFuturePlan(Guid id, CancellationToken cancellationToken)
    {
        var result = await _futurePlanService.DeleteFuturePlanAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    [HttpPost("{id:guid}/mark-done")]
    [ProducesResponseType(typeof(FuturePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FuturePlanResponse>> MarkFuturePlanDone(Guid id, CancellationToken cancellationToken)
    {
        var result = await _futurePlanService.MarkDoneAsync(id, cancellationToken);
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
