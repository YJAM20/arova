namespace LoveUniverse.Api.DTOs.Challenges;

public sealed class ChallengeCompletionResponse
{
    public Guid Id { get; set; }

    public Guid ChallengeId { get; set; }

    public Guid UserId { get; set; }

    public string UserDisplayName { get; set; } = string.Empty;

    public DateTime CompletedAt { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }
}
