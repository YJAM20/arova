using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Plans;

public sealed class SubscriptionResponse
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public SubscriptionPlanType PlanType { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool IsGifted { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
