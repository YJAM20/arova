using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LoveUniverse.Api.DTOs.CoupleGoals;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/couple-goals")]
public sealed class CoupleGoalsController : ControllerBase
{
    private readonly ICoupleGoalService _coupleGoalService;

    public CoupleGoalsController(ICoupleGoalService coupleGoalService)
    {
        _coupleGoalService = coupleGoalService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CoupleGoalResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CoupleGoalResponse>>> GetGoals(CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.GetGoalsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(CoupleGoalResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleGoalResponse>> GetGoal(Guid id, CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.GetGoalByIdAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CoupleGoalResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CoupleGoalResponse>> CreateGoal(
        CoupleGoalCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.CreateGoalAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetGoal), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CoupleGoalResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleGoalResponse>> UpdateGoal(
        Guid id,
        CoupleGoalUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.UpdateGoalAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteGoal(Guid id, CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.DeleteGoalAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(CoupleGoalResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleGoalResponse>> CompleteGoal(Guid id, CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.CompleteGoalAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("{id:guid}/milestones")]
    [ProducesResponseType(typeof(CoupleGoalMilestoneResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleGoalMilestoneResponse>> CreateMilestone(
        Guid id,
        MilestoneCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.CreateMilestoneAsync(id, request, cancellationToken);
        return ToActionResult(result, success => StatusCode(StatusCodes.Status201Created, success));
    }

    [HttpPut("{id:guid}/milestones/{milestoneId:guid}")]
    [ProducesResponseType(typeof(CoupleGoalMilestoneResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleGoalMilestoneResponse>> UpdateMilestone(
        Guid id,
        Guid milestoneId,
        MilestoneUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.UpdateMilestoneAsync(id, milestoneId, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}/milestones/{milestoneId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteMilestone(
        Guid id,
        Guid milestoneId,
        CancellationToken cancellationToken)
    {
        var result = await _coupleGoalService.DeleteMilestoneAsync(id, milestoneId, cancellationToken);
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
