using LoveUniverse.Api.DTOs.RelationshipScore;

namespace LoveUniverse.Api.Services;

public interface IRelationshipScoreService
{
    Task<ContentServiceResult<RelationshipScoreResponse>> GetScoreAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<IReadOnlyList<PointLedgerEntryResponse>>> GetLedgerAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<IReadOnlyList<DailyTaskResponse>>> GetDailyTasksAsync(CancellationToken cancellationToken = default);
    Task<ContentServiceResult<DailyTaskResponse>> CompleteDailyTaskAsync(Guid taskId, CancellationToken cancellationToken = default);
}
