using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Songs;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class SongService : ISongService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public SongService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<SongResponse>>> GetSongsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<SongResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var songs = await _dbContext.Songs
            .AsNoTracking()
            .Include(song => song.CreatedByUser)
            .Where(song => song.CoupleId == context.CoupleId)
            .OrderByDescending(song => song.IsFavorite)
            .ThenByDescending(song => song.CreatedAt)
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<SongResponse>>.Success(songs.Select(MapSong).ToList());
    }

    public async Task<ContentServiceResult<SongResponse>> CreateSongAsync(
        SongCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<SongResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<SongResponse>.Failure(ContentServiceStatus.BadRequest, "Song title is required.");
        }

        var song = new Song
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = title,
            Artist = CleanOptional(request.Artist),
            AudioUrl = CleanOptional(request.AudioUrl),
            CoverUrl = CleanOptional(request.CoverUrl),
            ExternalUrl = CleanOptional(request.SourceUrl),
            License = CleanOptional(request.License),
            Attribution = CleanOptional(request.Attribution),
            Notes = CleanOptional(request.Notes),
            VisibilityLevel = request.VisibilityLevel,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Songs.Add(song);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.Songs
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstAsync(candidate => candidate.Id == song.Id, cancellationToken);

        return ContentServiceResult<SongResponse>.Success(MapSong(created));
    }

    public async Task<ContentServiceResult<SongResponse>> UpdateSongAsync(
        Guid id,
        SongUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<SongResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var song = await _dbContext.Songs
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (song is null)
        {
            return ContentServiceResult<SongResponse>.Failure(ContentServiceStatus.NotFound, "Song was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(song.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<SongResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit songs you added.");
        }

        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<SongResponse>.Failure(ContentServiceStatus.BadRequest, "Song title is required.");
        }

        song.Title = title;
        song.Artist = CleanOptional(request.Artist);
        song.AudioUrl = CleanOptional(request.AudioUrl);
        song.CoverUrl = CleanOptional(request.CoverUrl);
        song.ExternalUrl = CleanOptional(request.SourceUrl);
        song.License = CleanOptional(request.License);
        song.Attribution = CleanOptional(request.Attribution);
        song.Notes = CleanOptional(request.Notes);
        song.VisibilityLevel = request.VisibilityLevel;
        song.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<SongResponse>.Success(MapSong(song));
    }

    public async Task<ContentServiceResult<bool>> DeleteSongAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var song = await _dbContext.Songs
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (song is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Song was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(song.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete songs you added.");
        }

        _dbContext.Songs.Remove(song);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<ContentServiceResult<SongResponse>> FavoriteSongAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<SongResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var song = await _dbContext.Songs
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (song is null)
        {
            return ContentServiceResult<SongResponse>.Failure(ContentServiceStatus.NotFound, "Song was not found.");
        }

        song.IsFavorite = true;
        song.FavoritedByUserId = context.UserId;
        song.FavoritedAt = DateTime.UtcNow;
        song.UpdatedAt = song.FavoritedAt;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<SongResponse>.Success(MapSong(song));
    }

    private async Task<AccessContext> GetAccessContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return AccessContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (coupleId is null || role is null)
        {
            return AccessContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return AccessContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static SongResponse MapSong(Song song)
    {
        return new SongResponse
        {
            Id = song.Id,
            Title = song.Title,
            Artist = song.Artist,
            AudioUrl = song.AudioUrl,
            CoverUrl = song.CoverUrl,
            SourceUrl = song.ExternalUrl,
            License = song.License,
            Attribution = song.Attribution,
            Notes = song.Notes,
            IsFavorite = song.IsFavorite,
            FavoritedAt = song.FavoritedAt,
            FavoritedByUserId = song.FavoritedByUserId,
            VisibilityLevel = song.VisibilityLevel,
            CreatedByUserId = song.CreatedByUserId,
            CreatedByDisplayName = song.CreatedByUser.DisplayName ?? song.CreatedByUser.Username,
            CreatedAt = song.CreatedAt,
            UpdatedAt = song.UpdatedAt
        };
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private sealed record AccessContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static AccessContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new AccessContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static AccessContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new AccessContext(false, null, null, null, status, errorMessage);
        }
    }
}
