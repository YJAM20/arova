using LoveUniverse.Api.DTOs.Letters;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/letters")]
public sealed class LettersController : ControllerBase
{
    private readonly ILetterService _letterService;

    public LettersController(ILetterService letterService)
    {
        _letterService = letterService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<LetterResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<LetterResponse>>> GetLetters(CancellationToken cancellationToken)
    {
        var result = await _letterService.GetLettersAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(LetterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LetterResponse>> GetLetter(Guid id, CancellationToken cancellationToken)
    {
        var result = await _letterService.GetLetterAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(LetterResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LetterResponse>> CreateLetter(
        LetterCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _letterService.CreateLetterAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetLetter), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(LetterResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LetterResponse>> UpdateLetter(
        Guid id,
        LetterUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _letterService.UpdateLetterAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteLetter(Guid id, CancellationToken cancellationToken)
    {
        var result = await _letterService.DeleteLetterAsync(id, cancellationToken);
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
