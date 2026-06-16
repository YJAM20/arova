using LoveUniverse.Api.DTOs.Couples;
using LoveUniverse.Api.DTOs.Plans;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/couples")]
public sealed class CouplesController : ControllerBase
{
    private readonly ICoupleService _coupleService;
    private readonly ISubscriptionService _subscriptionService;

    public CouplesController(ICoupleService coupleService, ISubscriptionService subscriptionService)
    {
        _coupleService = coupleService;
        _subscriptionService = subscriptionService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CoupleResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<CoupleResponse>> CreateCouple(
        CreateCoupleRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _coupleService.CreateCoupleAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetMyCouple), success));
    }

    [HttpGet("my")]
    [ProducesResponseType(typeof(CoupleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleResponse>> GetMyCouple(CancellationToken cancellationToken)
    {
        var result = await _coupleService.GetMyCoupleAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("pairing-code")]
    [ProducesResponseType(typeof(PairingCodeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PairingCodeResponse>> GeneratePairingCode(CancellationToken cancellationToken)
    {
        var result = await _coupleService.GeneratePairingCodeAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("join")]
    [ProducesResponseType(typeof(CoupleResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CoupleResponse>> JoinCouple(
        JoinCoupleRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _coupleService.JoinCoupleAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("members")]
    [ProducesResponseType(typeof(IReadOnlyList<CoupleMemberResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<IReadOnlyList<CoupleMemberResponse>>> GetMembers(CancellationToken cancellationToken)
    {
        var result = await _coupleService.GetMembersAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("subscription")]
    [ProducesResponseType(typeof(SubscriptionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubscriptionResponse>> GetSubscription(CancellationToken cancellationToken)
    {
        var result = await _subscriptionService.GetCurrentCoupleSubscriptionAsync(cancellationToken);
        return ToContentActionResult(result, Ok);
    }

    [HttpPut("subscription")]
    [ProducesResponseType(typeof(SubscriptionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SubscriptionResponse>> UpdateSubscription(
        SubscriptionUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _subscriptionService.UpdateCurrentCoupleSubscriptionAsync(request, cancellationToken);
        return ToContentActionResult(result, Ok);
    }

    private ActionResult<T> ToActionResult<T>(
        CoupleServiceResult<T> result,
        Func<T, ActionResult> onSuccess)
    {
        if (result.Status == CoupleServiceStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        var error = new { message = result.ErrorMessage ?? "The request could not be completed." };
        return result.Status switch
        {
            CoupleServiceStatus.BadRequest => BadRequest(error),
            CoupleServiceStatus.Unauthorized => Unauthorized(error),
            CoupleServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, error),
            CoupleServiceStatus.NotFound => NotFound(error),
            _ => BadRequest(error)
        };
    }

    private ActionResult<T> ToContentActionResult<T>(
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
