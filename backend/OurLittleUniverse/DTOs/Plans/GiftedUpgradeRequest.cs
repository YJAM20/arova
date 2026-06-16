using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Plans;

public sealed class GiftedUpgradeRequest
{
    public SubscriptionPlanType PlanType { get; set; } = SubscriptionPlanType.Pro;
}
