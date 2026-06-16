using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Plans;

public sealed class PlanResponse
{
    public SubscriptionPlanType PlanType { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public IReadOnlyList<string> Features { get; set; } = [];
}
