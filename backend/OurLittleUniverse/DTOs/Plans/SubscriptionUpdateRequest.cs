using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Plans;

public sealed class SubscriptionUpdateRequest
{
    public SubscriptionPlanType PlanType { get; set; } = SubscriptionPlanType.Free;
}
