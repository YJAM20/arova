namespace LoveUniverse.Api.DTOs.Profile;

public sealed class ProfileStatsResponse
{
    public string DisplayName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

    public string? Bio { get; set; }

    public int RelationshipLengthDays { get; set; }

    public DateTime? RelationshipStartedAt { get; set; }

    public int TotalPoints { get; set; }

    public string CurrentRank { get; set; } = string.Empty;

    public string? NextRank { get; set; }

    public int MemoriesCount { get; set; }

    public int LettersCount { get; set; }

    public int ReasonsCount { get; set; }

    public int PlanetCompletions { get; set; }

    public int ChatMessagesCount { get; set; }
}
