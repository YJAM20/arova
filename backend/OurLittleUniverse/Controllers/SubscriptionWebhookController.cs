using System.IO;
using System.Threading.Tasks;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[ApiController]
[Route("api/subscription")]
public sealed class SubscriptionWebhookController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionWebhookController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    [Authorize]
    [HttpPost("checkout-session")]
    [ProducesResponseType(typeof(CheckoutSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CheckoutSessionResponse>> CreateCheckoutSession(
        [FromBody] CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _subscriptionService.CreateCheckoutSessionAsync(
            request.PlanType,
            request.SuccessUrl,
            request.CancelUrl,
            cancellationToken);

        if (result.Status == ContentServiceStatus.Success && result.Value is not null)
        {
            return Ok(new CheckoutSessionResponse { SessionUrl = result.Value });
        }

        return BadRequest(new { message = result.ErrorMessage ?? "Could not create Stripe checkout session." });
    }

    [HttpPost("webhook")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> StripeWebhook()
    {
        var rawSignatureHeader = Request.Headers["Stripe-Signature"];
        if (string.IsNullOrEmpty(rawSignatureHeader))
        {
            return BadRequest(new { message = "Stripe-Signature header is missing." });
        }

        string signatureHeader = rawSignatureHeader.ToString();

        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync();

        var result = await _subscriptionService.ProcessWebhookAsync(json, signatureHeader, HttpContext.RequestAborted);
        if (result.Status == ContentServiceStatus.Success)
        {
            return Ok();
        }

        return BadRequest(new { message = result.ErrorMessage ?? "Failed to process webhook." });
    }
}

public sealed class CreateCheckoutSessionRequest
{
    public SubscriptionPlanType PlanType { get; set; } = SubscriptionPlanType.Pro;
    public string SuccessUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
}

public sealed class CheckoutSessionResponse
{
    public string SessionUrl { get; set; } = string.Empty;
}
