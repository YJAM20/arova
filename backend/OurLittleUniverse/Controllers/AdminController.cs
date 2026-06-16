using LoveUniverse.Api.DTOs.Admin;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin")]
public sealed class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("overview")]
    [ProducesResponseType(typeof(AdminOverviewResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminOverviewResponse>> GetOverview(CancellationToken cancellationToken)
    {
        var result = await _adminService.GetOverviewAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("feedback")]
    [ProducesResponseType(typeof(IReadOnlyList<AdminFeedbackResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<AdminFeedbackResponse>>> GetFeedback(CancellationToken cancellationToken)
    {
        var result = await _adminService.GetFeedbackAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("health")]
    [ProducesResponseType(typeof(AdminHealthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<AdminHealthResponse>> GetHealth(CancellationToken cancellationToken)
    {
        var result = await _adminService.GetHealthAsync(cancellationToken);
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
