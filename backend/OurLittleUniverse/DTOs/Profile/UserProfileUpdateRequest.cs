using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Profile;

public sealed class UserProfileUpdateRequest
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string DisplayName { get; set; } = string.Empty;

    public DateTime? DateOfBirth { get; set; }

    [StringLength(40)]
    public string? AgeRange { get; set; }

    [StringLength(80)]
    public string? RelationshipStatus { get; set; }

    [StringLength(80)]
    public string? RelationshipType { get; set; }

    [StringLength(120)]
    public string? PersonalityStyle { get; set; }

    [StringLength(120)]
    public string? LoveLanguage { get; set; }

    [StringLength(80)]
    public string? PreferredTheme { get; set; }

    [StringLength(8)]
    public string? PreferredLanguage { get; set; }

    [StringLength(2048)]
    public string? AvatarUrl { get; set; }

    [StringLength(1000)]
    public string? Bio { get; set; }
}
