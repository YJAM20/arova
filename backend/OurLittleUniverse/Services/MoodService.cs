using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Moods;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class MoodService : IMoodService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public MoodService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<MoodEntryResponse>>> GetMoodsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<MoodEntryResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var moods = await _dbContext.MoodEntries
            .AsNoTracking()
            .Include(mood => mood.User)
            .Include(mood => mood.RespondedByUser)
            .Where(mood => mood.CoupleId == context.CoupleId)
            .OrderByDescending(mood => mood.EntryDate)
            .ThenByDescending(mood => mood.CreatedAt)
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<MoodEntryResponse>>.Success(moods.Select(MapMood).ToList());
    }

    public async Task<ContentServiceResult<IReadOnlyList<MoodEntryResponse>>> GetTodayMoodsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<MoodEntryResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var moods = await _dbContext.MoodEntries
            .AsNoTracking()
            .Include(mood => mood.User)
            .Include(mood => mood.RespondedByUser)
            .Where(mood => mood.CoupleId == context.CoupleId && mood.EntryDate == today)
            .OrderBy(mood => mood.CreatedAt)
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<MoodEntryResponse>>.Success(moods.Select(MapMood).ToList());
    }

    public async Task<ContentServiceResult<MoodEntryResponse>> CreateMoodAsync(
        MoodEntryCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<MoodEntryResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var entryDate = request.EntryDate ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var exists = await _dbContext.MoodEntries
            .AsNoTracking()
            .AnyAsync(
                mood => mood.CoupleId == context.CoupleId
                    && mood.UserId == context.UserId
                    && mood.EntryDate == entryDate,
                cancellationToken);

        if (exists)
        {
            return ContentServiceResult<MoodEntryResponse>.Failure(
                ContentServiceStatus.BadRequest,
                "You already added a mood entry for this date.");
        }

        var now = DateTime.UtcNow;
        var moodEntry = new MoodEntry
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            EntryDate = entryDate,
            MoodValue = request.MoodValue,
            Note = CleanOptional(request.Note),
            CreatedAt = now
        };

        _dbContext.MoodEntries.Add(moodEntry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.MoodEntries
            .AsNoTracking()
            .Include(mood => mood.User)
            .Include(mood => mood.RespondedByUser)
            .FirstAsync(mood => mood.Id == moodEntry.Id, cancellationToken);

        return ContentServiceResult<MoodEntryResponse>.Success(MapMood(created));
    }

    public async Task<ContentServiceResult<MoodEntryResponse>> AddResponseAsync(
        Guid id,
        MoodResponseRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<MoodEntryResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var response = request.Response.Trim();
        if (string.IsNullOrWhiteSpace(response))
        {
            return ContentServiceResult<MoodEntryResponse>.Failure(ContentServiceStatus.BadRequest, "Response is required.");
        }

        var moodEntry = await _dbContext.MoodEntries
            .Include(mood => mood.User)
            .Include(mood => mood.RespondedByUser)
            .FirstOrDefaultAsync(mood => mood.Id == id && mood.CoupleId == context.CoupleId, cancellationToken);

        if (moodEntry is null)
        {
            return ContentServiceResult<MoodEntryResponse>.Failure(ContentServiceStatus.NotFound, "Mood entry was not found.");
        }

        var isOwner = context.Role == CoupleRole.Owner;
        var isOtherPartner = moodEntry.UserId != context.UserId;
        if (!isOwner && !isOtherPartner)
        {
            return ContentServiceResult<MoodEntryResponse>.Failure(
                ContentServiceStatus.Forbidden,
                "You can only respond to your partner's mood entry.");
        }

        moodEntry.Response = response;
        moodEntry.RespondedByUserId = context.UserId;
        moodEntry.RespondedAt = DateTime.UtcNow;
        moodEntry.UpdatedAt = moodEntry.RespondedAt;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var updated = await _dbContext.MoodEntries
            .AsNoTracking()
            .Include(mood => mood.User)
            .Include(mood => mood.RespondedByUser)
            .FirstAsync(mood => mood.Id == moodEntry.Id, cancellationToken);

        return ContentServiceResult<MoodEntryResponse>.Success(MapMood(updated));
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

    private static MoodEntryResponse MapMood(MoodEntry mood)
    {
        return new MoodEntryResponse
        {
            Id = mood.Id,
            EntryDate = mood.EntryDate,
            MoodValue = mood.MoodValue,
            Note = mood.Note,
            UserId = mood.UserId,
            UserDisplayName = mood.User.DisplayName ?? mood.User.Username,
            Response = mood.Response,
            RespondedByUserId = mood.RespondedByUserId,
            RespondedByDisplayName = mood.RespondedByUser is null
                ? null
                : mood.RespondedByUser.DisplayName ?? mood.RespondedByUser.Username,
            RespondedAt = mood.RespondedAt,
            CreatedAt = mood.CreatedAt,
            UpdatedAt = mood.UpdatedAt
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
