using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class Letter
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public bool IsLocked { get; set; }

    public string? PasscodeHash { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Private;

    public DateTime? OpenOnUtc { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser CreatedByUser { get; set; } = null!;
}
