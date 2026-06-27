using LoveUniverse.Api.DTOs.CheckIns;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/check-ins")]
public sealed class CheckInsController : ControllerBase
{
    private readonly ICheckInService _checkInService;

    public CheckInsController(ICheckInService checkInService)
    {
        _checkInService = checkInService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CheckInResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CheckInResponse>>> GetCheckIns(CancellationToken cancellationToken)
    {
        var result = await _checkInService.GetCheckInsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("today")]
    [ProducesResponseType(typeof(IReadOnlyList<CheckInResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CheckInResponse>>> GetTodayCheckIns(CancellationToken cancellationToken)
    {
        var result = await _checkInService.GetTodayCheckInsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(CheckInResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CheckInResponse>> CreateCheckIn(
        [FromBody] CheckInCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _checkInService.CreateCheckInAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(CheckInResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CheckInResponse>> UpdateCheckIn(
        Guid id,
        [FromBody] CheckInUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _checkInService.UpdateCheckInAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteCheckIn(Guid id, CancellationToken cancellationToken)
    {
        var result = await _checkInService.DeleteCheckInAsync(id, cancellationToken);
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
