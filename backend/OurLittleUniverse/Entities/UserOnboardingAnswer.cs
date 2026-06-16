namespace LoveUniverse.Api.Entities;

public sealed class UserOnboardingAnswer
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string QuestionKey { get; set; } = string.Empty;

    public string AnswerValue { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public AppUser User { get; set; } = null!;
}
