using LoveUniverse.Api.DTOs.Settings;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/settings")]
public sealed class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(CoupleSettingsResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<CoupleSettingsResponse>> GetSettings(CancellationToken cancellationToken)
    {
        var result = await _settingsService.GetSettingsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPut]
    [ProducesResponseType(typeof(CoupleSettingsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CoupleSettingsResponse>> UpdateSettings(
        CoupleSettingsUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _settingsService.UpdateSettingsAsync(request, cancellationToken);
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
