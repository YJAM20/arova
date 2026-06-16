using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Songs;

public sealed class SongUpdateRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Artist { get; set; }

    [StringLength(2048)]
    public string? AudioUrl { get; set; }

    [StringLength(2048)]
    public string? CoverUrl { get; set; }

    [StringLength(2048)]
    public string? SourceUrl { get; set; }

    [StringLength(200)]
    public string? License { get; set; }

    [StringLength(1000)]
    public string? Attribution { get; set; }

    [StringLength(2000)]
    public string? Notes { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;
}
