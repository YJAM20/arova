using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Letters;

public sealed class LetterResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Body { get; set; }

    public bool IsBodyHidden { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; }

    public DateTime? OpenOnUtc { get; set; }

    public DateTime? ReadAt { get; set; }

    public bool IsLocked { get; set; }

    public bool HasPasscode { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string CreatedByDisplayName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
