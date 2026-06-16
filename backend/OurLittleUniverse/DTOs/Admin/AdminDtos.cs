namespace LoveUniverse.Api.DTOs.Admin;

public sealed class AdminOverviewResponse
{
    public int TotalUsers { get; set; }

    public int TotalCouples { get; set; }

    public int VerifiedUsers { get; set; }

    public int UnverifiedUsers { get; set; }

    public int TotalMemories { get; set; }

    public int TotalReasons { get; set; }

    public int TotalLetters { get; set; }

    public int TotalChatMessages { get; set; }

    public int FeedbackCount { get; set; }

    public IReadOnlyList<PlanDistributionEntry> PlanDistribution { get; set; } = [];

    public string SystemHealth { get; set; } = "Healthy";
}

public sealed class PlanDistributionEntry
{
    public string PlanType { get; set; } = string.Empty;

    public int Count { get; set; }
}

public sealed class AdminFeedbackResponse
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public int? Rating { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Context { get; set; }

    public DateTime CreatedAt { get; set; }
}

public sealed class AdminHealthResponse
{
    public string Status { get; set; } = "Healthy";

    public int TotalUsers { get; set; }

    public int TotalCouples { get; set; }

    public string DatabaseStatus { get; set; } = "Connected";
}
