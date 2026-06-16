using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Auth;

public sealed class VerificationCodeRequest
{
    [Required]
    [StringLength(16, MinimumLength = 1)]
    public string Channel { get; set; } = string.Empty;

    [Required]
    [StringLength(256, MinimumLength = 1)]
    public string Destination { get; set; } = string.Empty;

    [Required]
    [StringLength(32, MinimumLength = 1)]
    public string Purpose { get; set; } = string.Empty;
}
