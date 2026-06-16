using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class CoupleSubscription
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public SubscriptionPlanType PlanType { get; set; } = SubscriptionPlanType.Free;

    public string Status { get; set; } = "Active";

    public bool IsGifted { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? ExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;
}
