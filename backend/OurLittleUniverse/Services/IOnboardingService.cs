using LoveUniverse.Api.DTOs.Onboarding;

namespace LoveUniverse.Api.Services;

public interface IOnboardingService
{
    Task<ContentServiceResult<IReadOnlyList<OnboardingQuestionResponse>>> GetQuestionsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>> GetMyAnswersAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>> UpsertAnswersAsync(OnboardingAnswersRequest request, CancellationToken cancellationToken = default);
}
