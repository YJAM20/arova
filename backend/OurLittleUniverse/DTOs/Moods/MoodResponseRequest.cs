using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Moods;

public sealed class MoodResponseRequest
{
    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Response { get; set; } = string.Empty;
}
