using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Auth;

public sealed class PasswordStrengthRequest
{
    [Required]
    [StringLength(256, MinimumLength = 1)]
    public string Password { get; set; } = string.Empty;
}
