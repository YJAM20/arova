using LoveUniverse.Api.DTOs.DailyQuestions;

namespace LoveUniverse.Api.Services;

public interface IDailyQuestionService
{
    Task<ContentServiceResult<DailyQuestionResponse>> GetTodayQuestionAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>> GetTodayAnswersAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>> GetHistoryAnswersAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<DailyQuestionAnswerResponse>> AnswerTodayQuestionAsync(DailyQuestionAnswerRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<DailyQuestionAnswerResponse>> UpdateAnswerAsync(Guid id, DailyQuestionAnswerRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteAnswerAsync(Guid id, CancellationToken cancellationToken = default);
}
