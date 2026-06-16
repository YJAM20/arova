using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.FuturePlans;

public sealed class FuturePlanResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime? PlannedFor { get; set; }

    public bool IsCompleted { get; set; }

    public string Status { get; set; } = "Planned";

    public DateTime? CompletedAt { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string CreatedByDisplayName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
