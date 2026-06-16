using LoveUniverse.Api.DTOs.Feedback;

namespace LoveUniverse.Api.Services;

public interface IFeedbackService
{
    Task<ContentServiceResult<FeedbackResponse>> CreateFeedbackAsync(FeedbackRequest request, CancellationToken cancellationToken = default);
}
