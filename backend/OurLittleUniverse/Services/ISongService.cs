using LoveUniverse.Api.DTOs.Songs;

namespace LoveUniverse.Api.Services;

public interface ISongService
{
    Task<ContentServiceResult<IReadOnlyList<SongResponse>>> GetSongsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<SongResponse>> CreateSongAsync(SongCreateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<SongResponse>> UpdateSongAsync(Guid id, SongUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<bool>> DeleteSongAsync(Guid id, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<SongResponse>> FavoriteSongAsync(Guid id, CancellationToken cancellationToken = default);
}
