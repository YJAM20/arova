namespace LoveUniverse.Api.Entities;

public sealed class UserProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public DateTime? DateOfBirth { get; set; }

    public string? AgeRange { get; set; }

    public string? RelationshipStatus { get; set; }

    public string? RelationshipType { get; set; }

    public string? PersonalityStyle { get; set; }

    public string? LoveLanguage { get; set; }

    public string? PreferredTheme { get; set; }

    public string? PreferredLanguage { get; set; }

    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    public bool MatureContentEnabled { get; set; }

    public DateTime UpdatedAt { get; set; }

    public AppUser User { get; set; } = null!;
}
