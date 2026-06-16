using LoveUniverse.Api.DTOs.Challenges;

namespace LoveUniverse.Api.Services;

public interface IChallengeService
{
    Task<ContentServiceResult<IReadOnlyList<ChallengeResponse>>> GetChallengesAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ChallengeResponse>> GetDailyChallengeAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ChallengeResponse>> CreateChallengeAsync(ChallengeCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ChallengeResponse>> UpdateChallengeAsync(Guid id, ChallengeUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteChallengeAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ChallengeCompletionResponse>> CompleteChallengeAsync(Guid id, ChallengeCompleteRequest request, CancellationToken cancellationToken = default);
}
