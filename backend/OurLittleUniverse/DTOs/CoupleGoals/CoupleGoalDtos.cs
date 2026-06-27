using System;
using System.Collections.Generic;

namespace LoveUniverse.Api.DTOs.CoupleGoals;

public sealed class CoupleGoalMilestoneResponse
{
    public Guid Id { get; set; }
    public Guid GoalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public sealed class CoupleGoalResponse
{
    public Guid Id { get; set; }
    public Guid CoupleId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string CreatedByDisplayName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? TargetDate { get; set; }
    public double ProgressPercent { get; set; }
    public bool IsPrivate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<CoupleGoalMilestoneResponse> Milestones { get; set; } = new();
}

public sealed class CoupleGoalCreateRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "custom";
    public string Status { get; set; } = "not-started";
    public DateTime? TargetDate { get; set; }
    public bool IsPrivate { get; set; }
    public double? ProgressPercent { get; set; }
}

public sealed class CoupleGoalUpdateRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "custom";
    public string Status { get; set; } = "not-started";
    public DateTime? TargetDate { get; set; }
    public bool IsPrivate { get; set; }
    public double? ProgressPercent { get; set; }
}

public sealed class MilestoneCreateRequest
{
    public string Title { get; set; } = string.Empty;
}

public sealed class MilestoneUpdateRequest
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; }
}
