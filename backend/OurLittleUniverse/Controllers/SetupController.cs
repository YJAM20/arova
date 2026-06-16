using LoveUniverse.Api.DTOs.Profile;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/setup")]
public sealed class SetupController : ControllerBase
{
    private readonly ICurrentUserService _currentUserService;
    private readonly ISetupStatusService _setupStatusService;

    public SetupController(ICurrentUserService currentUserService, ISetupStatusService setupStatusService)
    {
        _currentUserService = currentUserService;
        _setupStatusService = setupStatusService;
    }

    [HttpGet("status")]
    [ProducesResponseType(typeof(SetupStatusResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SetupStatusResponse>> GetStatus(CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId is not { } userId)
        {
            return Unauthorized(new { message = "Please sign in to continue." });
        }

        return Ok(await _setupStatusService.GetSetupStatusAsync(userId, cancellationToken));
    }
}
