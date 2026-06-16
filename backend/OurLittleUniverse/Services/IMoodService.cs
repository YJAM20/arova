using LoveUniverse.Api.DTOs.Moods;

namespace LoveUniverse.Api.Services;

public interface IMoodService
{
    Task<ContentServiceResult<IReadOnlyList<MoodEntryResponse>>> GetMoodsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<IReadOnlyList<MoodEntryResponse>>> GetTodayMoodsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<MoodEntryResponse>> CreateMoodAsync(MoodEntryCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<MoodEntryResponse>> AddResponseAsync(Guid id, MoodResponseRequest request, CancellationToken cancellationToken = default);
}
