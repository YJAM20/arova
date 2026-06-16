using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Letters;

public sealed class LetterCreateRequest
{
    [Required]
    [StringLength(160, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(8000, MinimumLength = 1)]
    public string Body { get; set; } = string.Empty;

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Private;

    public DateTime? OpenOnUtc { get; set; }

    public bool IsLocked { get; set; }

    [StringLength(128, MinimumLength = 4)]
    public string? Passcode { get; set; }
}
