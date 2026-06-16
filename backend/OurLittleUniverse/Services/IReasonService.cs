using LoveUniverse.Api.DTOs.Reasons;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

public interface IReasonService
{
    Task<ContentServiceResult<IReadOnlyList<ReasonResponse>>> GetReasonsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ReasonResponse>> GetDailyReasonAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ReasonResponse>> GetRandomReasonAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ReasonResponse>> GetReasonAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ReasonResponse>> CreateReasonAsync(ReasonCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ReasonResponse>> UpdateReasonAsync(Guid id, ReasonUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteReasonAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ReasonReactionResponse>> AddReactionAsync(Guid id, ReasonReactionRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteReactionAsync(Guid id, ReactionType type, CancellationToken cancellationToken = default);
}
