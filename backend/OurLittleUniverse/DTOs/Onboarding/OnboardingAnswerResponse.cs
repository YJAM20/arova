namespace LoveUniverse.Api.DTOs.Onboarding;

public sealed class OnboardingAnswerResponse
{
    public string QuestionKey { get; set; } = string.Empty;

    public string AnswerValue { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
