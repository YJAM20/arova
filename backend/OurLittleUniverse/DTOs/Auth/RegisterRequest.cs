using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Auth;

public sealed class RegisterRequest
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [StringLength(64, MinimumLength = 3)]
    [RegularExpression("^[a-zA-Z0-9_.-]+$", ErrorMessage = "Username may contain letters, numbers, underscores, dots, and hyphens only.")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
}
