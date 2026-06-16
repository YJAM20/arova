using LoveUniverse.Api.DTOs.FuturePlans;

namespace LoveUniverse.Api.Services;

public interface IFuturePlanService
{
    Task<ContentServiceResult<IReadOnlyList<FuturePlanResponse>>> GetFuturePlansAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<FuturePlanResponse>> GetFuturePlanAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<FuturePlanResponse>> CreateFuturePlanAsync(FuturePlanCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<FuturePlanResponse>> UpdateFuturePlanAsync(Guid id, FuturePlanUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteFuturePlanAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<FuturePlanResponse>> MarkDoneAsync(Guid id, CancellationToken cancellationToken = default);
}
