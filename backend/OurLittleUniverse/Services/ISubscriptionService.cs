using LoveUniverse.Api.DTOs.Plans;

namespace LoveUniverse.Api.Services;

public interface ISubscriptionService
{
    IReadOnlyList<PlanResponse> GetPlans();

    Task<ContentServiceResult<SubscriptionResponse>> GetCurrentCoupleSubscriptionAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<SubscriptionResponse>> UpdateCurrentCoupleSubscriptionAsync(SubscriptionUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<GiftedUpgradeResponse>> GiftedUpgradeAsync(GiftedUpgradeRequest request, CancellationToken cancellationToken = default);
}
