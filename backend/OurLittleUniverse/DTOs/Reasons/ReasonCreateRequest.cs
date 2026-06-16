using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Reasons;

public sealed class ReasonCreateRequest
{
    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Text { get; set; } = string.Empty;

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;

    public DateTime? UnlockDate { get; set; }
}
