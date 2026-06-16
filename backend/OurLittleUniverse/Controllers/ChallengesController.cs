using LoveUniverse.Api.DTOs.Challenges;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/challenges")]
public sealed class ChallengesController : ControllerBase
{
    private readonly IChallengeService _challengeService;

    public ChallengesController(IChallengeService challengeService)
    {
        _challengeService = challengeService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ChallengeResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ChallengeResponse>>> GetChallenges(CancellationToken cancellationToken)
    {
        var result = await _challengeService.GetChallengesAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("daily")]
    [ProducesResponseType(typeof(ChallengeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChallengeResponse>> GetDailyChallenge(CancellationToken cancellationToken)
    {
        var result = await _challengeService.GetDailyChallengeAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ChallengeResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ChallengeResponse>> CreateChallenge(
        ChallengeCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _challengeService.CreateChallengeAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetChallenges), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ChallengeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChallengeResponse>> UpdateChallenge(
        Guid id,
        ChallengeUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _challengeService.UpdateChallengeAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteChallenge(Guid id, CancellationToken cancellationToken)
    {
        var result = await _challengeService.DeleteChallengeAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(typeof(ChallengeCompletionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ChallengeCompletionResponse>> CompleteChallenge(
        Guid id,
        ChallengeCompleteRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _challengeService.CompleteChallengeAsync(id, request, cancellationToken);
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
