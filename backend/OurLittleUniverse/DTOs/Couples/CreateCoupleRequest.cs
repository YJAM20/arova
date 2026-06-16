using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Couples;

public sealed class CreateCoupleRequest
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;
}
