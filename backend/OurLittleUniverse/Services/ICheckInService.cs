using LoveUniverse.Api.DTOs.CheckIns;

namespace LoveUniverse.Api.Services;

public interface ICheckInService
{
    Task<ContentServiceResult<IReadOnlyList<CheckInResponse>>> GetCheckInsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<CheckInResponse>>> GetTodayCheckInsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<CheckInResponse>> CreateCheckInAsync(CheckInCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<CheckInResponse>> UpdateCheckInAsync(Guid id, CheckInUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteCheckInAsync(Guid id, CancellationToken cancellationToken = default);
}
