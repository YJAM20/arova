using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Reasons;

public sealed class ReasonResponse
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public VisibilityLevel VisibilityLevel { get; set; }

    public DateTime? UnlockDate { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string CreatedByDisplayName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public IReadOnlyList<ReasonReactionResponse> Reactions { get; set; } = [];
}
