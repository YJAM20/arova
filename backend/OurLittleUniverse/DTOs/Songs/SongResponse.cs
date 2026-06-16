using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Songs;

public sealed class SongResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Artist { get; set; }

    public string? AudioUrl { get; set; }

    public string? CoverUrl { get; set; }

    public string? SourceUrl { get; set; }

    public string? License { get; set; }

    public string? Attribution { get; set; }

    public string? Notes { get; set; }

    public bool IsFavorite { get; set; }

    public DateTime? FavoritedAt { get; set; }

    public Guid? FavoritedByUserId { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string CreatedByDisplayName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
