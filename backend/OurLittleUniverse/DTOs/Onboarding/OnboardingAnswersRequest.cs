using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Onboarding;

public sealed class OnboardingAnswersRequest
{
    [Required]
    public IReadOnlyList<OnboardingAnswerItem> Answers { get; set; } = [];
}

public sealed class OnboardingAnswerItem
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string QuestionKey { get; set; } = string.Empty;

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string AnswerValue { get; set; } = string.Empty;
}
