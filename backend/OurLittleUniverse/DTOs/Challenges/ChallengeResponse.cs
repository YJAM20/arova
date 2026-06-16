namespace LoveUniverse.Api.DTOs.Challenges;

public sealed class ChallengeResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime? StartsAt { get; set; }

    public DateTime? EndsAt { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string CreatedByDisplayName { get; set; } = string.Empty;

    public bool IsCompletedByCurrentUser { get; set; }

    public int CompletionCount { get; set; }

    public IReadOnlyList<ChallengeCompletionResponse> Completions { get; set; } = [];

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
