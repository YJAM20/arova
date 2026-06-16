namespace LoveUniverse.Api.Entities;

public sealed class ChallengeCompletion
{
    public Guid Id { get; set; }

    public Guid ChallengeId { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public DateTime CompletedAt { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Challenge Challenge { get; set; } = null!;

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
