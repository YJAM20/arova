using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class Memory
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? PrivateNote { get; set; }

    public DateTime? MemoryDate { get; set; }

    public string? Location { get; set; }

    public string? MediaUrl { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser CreatedByUser { get; set; } = null!;
}
