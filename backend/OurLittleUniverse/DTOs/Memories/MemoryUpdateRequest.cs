using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Memories;

public sealed class MemoryUpdateRequest
{
    [Required]
    [StringLength(160, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    [StringLength(4000)]
    public string? PrivateNote { get; set; }

    public DateTime? MemoryDate { get; set; }

    [StringLength(240)]
    public string? Location { get; set; }

    [StringLength(2048)]
    public string? MediaUrl { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;
}
