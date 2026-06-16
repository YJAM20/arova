using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.FuturePlans;

public sealed class FuturePlanCreateRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    public DateTime? PlannedFor { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;
}
