using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Auth;

public sealed class LoginRequest
{
    [Required]
    [StringLength(256, MinimumLength = 1)]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 1)]
    public string Password { get; set; } = string.Empty;
}
