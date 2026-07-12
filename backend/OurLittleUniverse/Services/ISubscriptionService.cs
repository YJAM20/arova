using LoveUniverse.Api.DTOs.Plans;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

public interface ISubscriptionService
{
    IReadOnlyList<PlanResponse> GetPlans();

    Task<ContentServiceResult<SubscriptionResponse>> GetCurrentCoupleSubscriptionAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<SubscriptionResponse>> UpdateCurrentCoupleSubscriptionAsync(SubscriptionUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<GiftedUpgradeResponse>> GiftedUpgradeAsync(GiftedUpgradeRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<string>> CreateCheckoutSessionAsync(SubscriptionPlanType planType, string successUrl, string cancelUrl, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> ProcessWebhookAsync(string json, string stripeSignature, CancellationToken cancellationToken = default);
}
