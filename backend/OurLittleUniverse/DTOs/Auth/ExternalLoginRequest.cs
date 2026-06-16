using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Auth;

public sealed class ExternalLoginRequest
{
    [Required]
    [StringLength(32, MinimumLength = 1)]
    public string Provider { get; set; } = string.Empty;

    [Required]
    [StringLength(4096, MinimumLength = 1)]
    public string IdToken { get; set; } = string.Empty;
}
