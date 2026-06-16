using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class Song
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Artist { get; set; }

    public string? ExternalUrl { get; set; }

    public string? AudioUrl { get; set; }

    public string? CoverUrl { get; set; }

    public string? License { get; set; }

    public string? Attribution { get; set; }

    public string? Notes { get; set; }

    public bool IsFavorite { get; set; }

    public DateTime? FavoritedAt { get; set; }

    public Guid? FavoritedByUserId { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser CreatedByUser { get; set; } = null!;

    public AppUser? FavoritedByUser { get; set; }
}
