using LoveUniverse.Api.DTOs.Songs;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/songs")]
public sealed class SongsController : ControllerBase
{
    private readonly ISongService _songService;

    public SongsController(ISongService songService)
    {
        _songService = songService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SongResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<SongResponse>>> GetSongs(CancellationToken cancellationToken)
    {
        var result = await _songService.GetSongsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(SongResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<SongResponse>> CreateSong(
        SongCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _songService.CreateSongAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetSongs), new { id = success.Id }, success));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(SongResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SongResponse>> UpdateSong(
        Guid id,
        SongUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _songService.UpdateSongAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteSong(Guid id, CancellationToken cancellationToken)
    {
        var result = await _songService.DeleteSongAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    [HttpPost("{id:guid}/favorite")]
    [ProducesResponseType(typeof(SongResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SongResponse>> FavoriteSong(Guid id, CancellationToken cancellationToken)
    {
        var result = await _songService.FavoriteSongAsync(id, cancellationToken);
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
