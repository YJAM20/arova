using LoveUniverse.Api.DTOs.Moods;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/moods")]
public sealed class MoodsController : ControllerBase
{
    private readonly IMoodService _moodService;

    public MoodsController(IMoodService moodService)
    {
        _moodService = moodService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<MoodEntryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MoodEntryResponse>>> GetMoods(CancellationToken cancellationToken)
    {
        var result = await _moodService.GetMoodsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("today")]
    [ProducesResponseType(typeof(IReadOnlyList<MoodEntryResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<MoodEntryResponse>>> GetTodayMoods(CancellationToken cancellationToken)
    {
        var result = await _moodService.GetTodayMoodsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(MoodEntryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<MoodEntryResponse>> CreateMood(
        MoodEntryCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _moodService.CreateMoodAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetMoods), new { id = success.Id }, success));
    }

    [HttpPost("{id:guid}/response")]
    [ProducesResponseType(typeof(MoodEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<MoodEntryResponse>> AddResponse(
        Guid id,
        MoodResponseRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _moodService.AddResponseAsync(id, request, cancellationToken);
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
