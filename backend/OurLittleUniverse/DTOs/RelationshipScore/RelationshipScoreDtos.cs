namespace LoveUniverse.Api.DTOs.RelationshipScore;

public sealed class RelationshipScoreResponse
{
    public int TotalPoints { get; set; }

    public string CurrentRank { get; set; } = string.Empty;

    public string? NextRank { get; set; }

    public int NextRankThreshold { get; set; }

    public double ProgressPercent { get; set; }
}

public sealed class PointLedgerEntryResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string ActionType { get; set; } = string.Empty;

    public int Points { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string? SourceType { get; set; }

    public DateTime CreatedAt { get; set; }
}

public sealed class DailyTaskResponse
{
    public Guid Id { get; set; }

    public string TaskKey { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int PointsReward { get; set; }

    public DateOnly Date { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }
}
