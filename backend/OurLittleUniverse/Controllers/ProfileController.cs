using LoveUniverse.Api.DTOs.Profile;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/profile")]
public sealed class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserProfileResponse>> GetMe(CancellationToken cancellationToken)
    {
        var result = await _profileService.GetMyProfileAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserProfileResponse>> UpdateMe(
        UserProfileUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _profileService.UpsertMyProfileAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("content-safety")]
    [ProducesResponseType(typeof(ContentSafetyResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<ContentSafetyResponse>> GetContentSafety(CancellationToken cancellationToken)
    {
        var result = await _profileService.GetContentSafetyAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPut("mature-content")]
    [ProducesResponseType(typeof(ContentSafetyResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ContentSafetyResponse>> UpdateMatureContent(
        MatureContentUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _profileService.UpdateMatureContentAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(ProfileStatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProfileStatsResponse>> GetProfileStats(CancellationToken cancellationToken)
    {
        var result = await _profileService.GetProfileStatsAsync(cancellationToken);
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
