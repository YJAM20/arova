using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class ReasonReaction
{
    public Guid Id { get; set; }

    public Guid ReasonId { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public ReactionType ReactionType { get; set; } = ReactionType.Heart;

    public DateTime CreatedAt { get; set; }

    public Reason Reason { get; set; } = null!;

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
