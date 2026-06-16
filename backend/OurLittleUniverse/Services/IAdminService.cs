using LoveUniverse.Api.DTOs.Admin;

namespace LoveUniverse.Api.Services;

public interface IAdminService
{
    Task<ContentServiceResult<AdminOverviewResponse>> GetOverviewAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<IReadOnlyList<AdminFeedbackResponse>>> GetFeedbackAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<AdminHealthResponse>> GetHealthAsync(CancellationToken cancellationToken = default);
}
