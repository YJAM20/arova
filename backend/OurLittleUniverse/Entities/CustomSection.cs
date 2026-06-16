using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class CustomSection
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Icon { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser CreatedByUser { get; set; } = null!;

    public ICollection<CustomSectionItem> Items { get; set; } = new List<CustomSectionItem>();
}
