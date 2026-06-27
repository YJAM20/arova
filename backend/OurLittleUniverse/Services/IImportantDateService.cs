using LoveUniverse.Api.DTOs.ImportantDates;
using LoveUniverse.Api.Services;

namespace LoveUniverse.Api.Services;

public interface IImportantDateService
{
    Task<ContentServiceResult<IReadOnlyList<ImportantDateResponse>>> GetVisibleDatesAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<ImportantDateResponse>>> GetUpcomingDatesAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ImportantDateResponse>> GetDateByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ImportantDateResponse>> CreateDateAsync(ImportantDateCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ImportantDateResponse>> UpdateDateAsync(Guid id, ImportantDateUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteDateAsync(Guid id, CancellationToken cancellationToken = default);

    Task<int> SendReminderEmailsAsync(CancellationToken cancellationToken = default);
}
