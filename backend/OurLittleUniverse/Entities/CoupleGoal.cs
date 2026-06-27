using System;
using System.Collections.Generic;

namespace LoveUniverse.Api.Entities;

public sealed class CoupleGoal
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Category { get; set; } = "custom";

    public string Status { get; set; } = "not-started";

    public DateTime? TargetDate { get; set; }

    public double ProgressPercent { get; set; }

    public bool IsPrivate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser CreatedByUser { get; set; } = null!;

    public ICollection<CoupleGoalMilestone> Milestones { get; set; } = new List<CoupleGoalMilestone>();
}
