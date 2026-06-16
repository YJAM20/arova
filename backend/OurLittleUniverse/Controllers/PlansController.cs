using LoveUniverse.Api.DTOs.Plans;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[ApiController]
[Route("api/plans")]
public sealed class PlansController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public PlansController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<PlanResponse>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<PlanResponse>> GetPlans()
    {
        return Ok(_subscriptionService.GetPlans());
    }

    [Authorize]
    [HttpPost("gifted-upgrade")]
    [ProducesResponseType(typeof(GiftedUpgradeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<GiftedUpgradeResponse>> GiftedUpgrade(
        GiftedUpgradeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _subscriptionService.GiftedUpgradeAsync(request, cancellationToken);
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
