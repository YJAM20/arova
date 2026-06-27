using System;

namespace LoveUniverse.Api.Entities;

public sealed class CoupleGoalMilestone
{
    public Guid Id { get; set; }

    public Guid GoalId { get; set; }

    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public CoupleGoal Goal { get; set; } = null!;
}
