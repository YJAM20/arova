using LoveUniverse.Api.DTOs.Reasons;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/reasons")]
public sealed class ReasonsController : ControllerBase
{
    private readonly IReasonService _reasonService;

    public ReasonsController(IReasonService reasonService)
    {
        _reasonService = reasonService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ReasonResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ReasonResponse>>> GetReasons(CancellationToken cancellationToken)
    {
        var result = await _reasonService.GetReasonsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("daily")]
    [ProducesResponseType(typeof(ReasonResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReasonResponse>> GetDailyReason(CancellationToken cancellationToken)
    {
        var result = await _reasonService.GetDailyReasonAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("random")]
    [ProducesResponseType(typeof(ReasonResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReasonResponse>> GetRandomReason(CancellationToken cancellationToken)
    {
        var result = await _reasonService.GetRandomReasonAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ReasonResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReasonResponse>> GetReason(Guid id, CancellationToken cancellationToken)
    {
        var result = await _reasonService.GetReasonAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ReasonResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ReasonResponse>> CreateReason(
        ReasonCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _reasonService.CreateReasonAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetReason), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ReasonResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReasonResponse>> UpdateReason(
        Guid id,
        ReasonUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _reasonService.UpdateReasonAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteReason(Guid id, CancellationToken cancellationToken)
    {
        var result = await _reasonService.DeleteReasonAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    [HttpPost("{id:guid}/reactions")]
    [ProducesResponseType(typeof(ReasonReactionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ReasonReactionResponse>> AddReaction(
        Guid id,
        ReasonReactionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _reasonService.AddReactionAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}/reactions/{type}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteReaction(
        Guid id,
        ReactionType type,
        CancellationToken cancellationToken)
    {
        var result = await _reasonService.DeleteReactionAsync(id, type, cancellationToken);
        return ToActionResult(result, _ => NoContent());
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
