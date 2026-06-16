using LoveUniverse.Api.DTOs.RelationshipScore;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/relationship-score")]
public sealed class RelationshipScoreController : ControllerBase
{
    private readonly IRelationshipScoreService _relationshipScoreService;

    public RelationshipScoreController(IRelationshipScoreService relationshipScoreService)
    {
        _relationshipScoreService = relationshipScoreService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(RelationshipScoreResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<RelationshipScoreResponse>> GetScore(CancellationToken cancellationToken)
    {
        var result = await _relationshipScoreService.GetScoreAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("ledger")]
    [ProducesResponseType(typeof(IReadOnlyList<PointLedgerEntryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PointLedgerEntryResponse>>> GetLedger(CancellationToken cancellationToken)
    {
        var result = await _relationshipScoreService.GetLedgerAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("daily-tasks")]
    [ProducesResponseType(typeof(IReadOnlyList<DailyTaskResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DailyTaskResponse>>> GetDailyTasks(CancellationToken cancellationToken)
    {
        var result = await _relationshipScoreService.GetDailyTasksAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("daily-tasks/{id:guid}/complete")]
    [ProducesResponseType(typeof(DailyTaskResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyTaskResponse>> CompleteDailyTask(Guid id, CancellationToken cancellationToken)
    {
        var result = await _relationshipScoreService.CompleteDailyTaskAsync(id, cancellationToken);
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
