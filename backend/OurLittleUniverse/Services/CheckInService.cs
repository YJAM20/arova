using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.CheckIns;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class CheckInService : ICheckInService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public CheckInService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<CheckInResponse>>> GetCheckInsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<CheckInResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var checkIns = await _dbContext.CheckIns
            .Include(c => c.User)
            .Where(c => c.CoupleId == context.CoupleId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = checkIns.Select(c => MapCheckIn(c)).ToList();
        return ContentServiceResult<IReadOnlyList<CheckInResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<IReadOnlyList<CheckInResponse>>> GetTodayCheckInsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<CheckInResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var today = DateTime.UtcNow.Date;
        var checkIns = await _dbContext.CheckIns
            .Include(c => c.User)
            .Where(c => c.CoupleId == context.CoupleId && c.CreatedAt >= today)
            .ToListAsync(cancellationToken);

        var responses = checkIns.Select(c => MapCheckIn(c)).ToList();
        return ContentServiceResult<IReadOnlyList<CheckInResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<CheckInResponse>> CreateCheckInAsync(
        CheckInCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CheckInResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (request.ConnectionLevel < 1 || request.ConnectionLevel > 5 ||
            request.EnergyLevel < 1 || request.EnergyLevel > 5 ||
            request.CommunicationFeeling < 1 || request.CommunicationFeeling > 5)
        {
            return ContentServiceResult<CheckInResponse>.Failure(ContentServiceStatus.BadRequest, "All level ratings must be between 1 and 5.");
        }

        var today = DateTime.UtcNow.Date;
        var existing = await _dbContext.CheckIns
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.CoupleId == context.CoupleId
                && c.UserId == context.UserId
                && c.CreatedAt >= today, cancellationToken);

        var now = DateTime.UtcNow;

        if (existing is not null)
        {
            existing.Mood = request.ConnectionLevel;
            existing.Energy = request.EnergyLevel;
            existing.Need = request.CommunicationFeeling;
            existing.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
            existing.UpdatedAt = now;

            await _dbContext.SaveChangesAsync(cancellationToken);
            return ContentServiceResult<CheckInResponse>.Success(MapCheckIn(existing));
        }

        var checkIn = new CheckIn
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            Mood = request.ConnectionLevel,
            Energy = request.EnergyLevel,
            Need = request.CommunicationFeeling,
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
            CreatedAt = now
        };

        _dbContext.CheckIns.Add(checkIn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var user = await _dbContext.AppUsers
            .FirstAsync(u => u.Id == context.UserId, cancellationToken);

        checkIn.User = user;

        return ContentServiceResult<CheckInResponse>.Success(MapCheckIn(checkIn));
    }

    public async Task<ContentServiceResult<CheckInResponse>> UpdateCheckInAsync(
        Guid id,
        CheckInUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CheckInResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (request.ConnectionLevel < 1 || request.ConnectionLevel > 5 ||
            request.EnergyLevel < 1 || request.EnergyLevel > 5 ||
            request.CommunicationFeeling < 1 || request.CommunicationFeeling > 5)
        {
            return ContentServiceResult<CheckInResponse>.Failure(ContentServiceStatus.BadRequest, "All level ratings must be between 1 and 5.");
        }

        var checkIn = await _dbContext.CheckIns
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == id && c.CoupleId == context.CoupleId, cancellationToken);

        if (checkIn is null)
        {
            return ContentServiceResult<CheckInResponse>.Failure(ContentServiceStatus.NotFound, "Check-in not found.");
        }

        if (checkIn.UserId != context.UserId)
        {
            return ContentServiceResult<CheckInResponse>.Failure(ContentServiceStatus.Forbidden, "You can only update your own check-ins.");
        }

        checkIn.Mood = request.ConnectionLevel;
        checkIn.Energy = request.EnergyLevel;
        checkIn.Need = request.CommunicationFeeling;
        checkIn.Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim();
        checkIn.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<CheckInResponse>.Success(MapCheckIn(checkIn));
    }

    public async Task<ContentServiceResult<bool>> DeleteCheckInAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var checkIn = await _dbContext.CheckIns
            .FirstOrDefaultAsync(c => c.Id == id && c.CoupleId == context.CoupleId, cancellationToken);

        if (checkIn is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Check-in not found.");
        }

        if (checkIn.UserId != context.UserId)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete your own check-ins.");
        }

        _dbContext.CheckIns.Remove(checkIn);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    private async Task<ContentContext> GetContentContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        if (coupleId is null)
        {
            return ContentContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (role is null)
        {
            return ContentContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return ContentContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static CheckInResponse MapCheckIn(CheckIn checkIn)
    {
        return new CheckInResponse
        {
            Id = checkIn.Id,
            UserId = checkIn.UserId,
            UserDisplayName = checkIn.User.DisplayName ?? checkIn.User.Username,
            DateKey = checkIn.CreatedAt.ToString("yyyy-MM-dd"),
            ConnectionLevel = checkIn.Mood,
            EnergyLevel = checkIn.Energy,
            CommunicationFeeling = checkIn.Need,
            Note = checkIn.Note,
            CreatedAt = checkIn.CreatedAt,
            UpdatedAt = checkIn.UpdatedAt
        };
    }

    private sealed record ContentContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static ContentContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new ContentContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static ContentContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new ContentContext(false, null, null, null, status, errorMessage);
        }
    }
}
