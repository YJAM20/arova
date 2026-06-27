using LoveUniverse.Api.DTOs.ImportantDates;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/important-dates")]
public sealed class ImportantDatesController : ControllerBase
{
    private readonly IImportantDateService _importantDateService;
    private readonly IAdminService _adminService;

    public ImportantDatesController(IImportantDateService importantDateService, IAdminService adminService)
    {
        _importantDateService = importantDateService;
        _adminService = adminService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ImportantDateResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ImportantDateResponse>>> GetVisibleDates(CancellationToken cancellationToken)
    {
        var result = await _importantDateService.GetVisibleDatesAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("upcoming")]
    [ProducesResponseType(typeof(IReadOnlyList<ImportantDateResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ImportantDateResponse>>> GetUpcomingDates(CancellationToken cancellationToken)
    {
        var result = await _importantDateService.GetUpcomingDatesAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ImportantDateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ImportantDateResponse>> GetDateById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _importantDateService.GetDateByIdAsync(id, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ImportantDateResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImportantDateResponse>> CreateDate(
        [FromBody] ImportantDateCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _importantDateService.CreateDateAsync(request, cancellationToken);
        return ToActionResult(result, response => CreatedAtAction(nameof(GetDateById), new { id = response.Id }, response));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ImportantDateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ImportantDateResponse>> UpdateDate(
        Guid id,
        [FromBody] ImportantDateUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _importantDateService.UpdateDateAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteDate(Guid id, CancellationToken cancellationToken)
    {
        var result = await _importantDateService.DeleteDateAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    [HttpPost("reminders/send-test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult> SendTestReminders(CancellationToken cancellationToken)
    {
        // Require admin access. Check via AdminService.
        var overviewResult = await _adminService.GetOverviewAsync(cancellationToken);
        if (!overviewResult.Succeeded)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Admin access required." });
        }

        var sentCount = await _importantDateService.SendReminderEmailsAsync(cancellationToken);
        return Ok(new { message = $"Reminder check completed. Sent {sentCount} emails." });
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
