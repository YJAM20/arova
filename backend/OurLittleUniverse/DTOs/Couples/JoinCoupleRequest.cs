using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Couples;

public sealed class JoinCoupleRequest
{
    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string Code { get; set; } = string.Empty;
}
