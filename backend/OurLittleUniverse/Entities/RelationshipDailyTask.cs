namespace LoveUniverse.Api.Entities;

public sealed class RelationshipDailyTask
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public string TaskKey { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int PointsReward { get; set; }

    public DateOnly Date { get; set; }

    public bool IsCompleted { get; set; }

    public Guid? CompletedByUserId { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser? CompletedByUser { get; set; }
}
