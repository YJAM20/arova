using System.Security.Cryptography;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Reasons;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class ReasonService : IReasonService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public ReasonService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<ReasonResponse>>> GetReasonsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<ReasonResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var reasons = await GetCoupleReasonsQuery(context.CoupleId!.Value)
            .OrderByDescending(reason => reason.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = reasons
            .Where(reason => CanView(reason, context))
            .Select(reason => MapReason(reason, context))
            .ToList();

        return ContentServiceResult<IReadOnlyList<ReasonResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<ReasonResponse>> GetDailyReasonAsync(CancellationToken cancellationToken = default)
    {
        var visibleReasons = await GetUnlockedVisibleReasonsAsync(cancellationToken);
        if (!visibleReasons.Succeeded)
        {
            return ContentServiceResult<ReasonResponse>.Failure(
                visibleReasons.Status,
                visibleReasons.ErrorMessage ?? "The request could not be completed.");
        }

        if (visibleReasons.Value is null || visibleReasons.Value.Count == 0)
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.NotFound, "No visible unlocked reasons were found.");
        }

        var index = DateTime.UtcNow.DayOfYear % visibleReasons.Value.Count;
        return ContentServiceResult<ReasonResponse>.Success(visibleReasons.Value[index]);
    }

    public async Task<ContentServiceResult<ReasonResponse>> GetRandomReasonAsync(CancellationToken cancellationToken = default)
    {
        var visibleReasons = await GetUnlockedVisibleReasonsAsync(cancellationToken);
        if (!visibleReasons.Succeeded)
        {
            return ContentServiceResult<ReasonResponse>.Failure(
                visibleReasons.Status,
                visibleReasons.ErrorMessage ?? "The request could not be completed.");
        }

        if (visibleReasons.Value is null || visibleReasons.Value.Count == 0)
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.NotFound, "No visible unlocked reasons were found.");
        }

        var index = RandomNumberGenerator.GetInt32(visibleReasons.Value.Count);
        return ContentServiceResult<ReasonResponse>.Success(visibleReasons.Value[index]);
    }

    public async Task<ContentServiceResult<ReasonResponse>> GetReasonAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ReasonResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var reason = await GetCoupleReasonsQuery(context.CoupleId!.Value)
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

        if (reason is null || !CanView(reason, context))
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.NotFound, "Reason was not found.");
        }

        return ContentServiceResult<ReasonResponse>.Success(MapReason(reason, context));
    }

    public async Task<ContentServiceResult<ReasonResponse>> CreateReasonAsync(
        ReasonCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ReasonResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var text = request.Text.Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.BadRequest, "Reason text is required.");
        }

        var now = DateTime.UtcNow;
        var reason = new Reason
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Text = text,
            VisibilityLevel = request.VisibilityLevel,
            UnlockDate = request.UnlockDate,
            CreatedAt = now
        };

        _dbContext.Reasons.Add(reason);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await GetCoupleReasonsQuery(context.CoupleId.Value)
            .FirstAsync(candidate => candidate.Id == reason.Id, cancellationToken);

        return ContentServiceResult<ReasonResponse>.Success(MapReason(created, context));
    }

    public async Task<ContentServiceResult<ReasonResponse>> UpdateReasonAsync(
        Guid id,
        ReasonUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ReasonResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var reason = await _dbContext.Reasons
            .Include(candidate => candidate.CreatedByUser)
            .Include(candidate => candidate.Reactions)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (reason is null)
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.NotFound, "Reason was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(reason.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit reasons you created.");
        }

        var text = request.Text.Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return ContentServiceResult<ReasonResponse>.Failure(ContentServiceStatus.BadRequest, "Reason text is required.");
        }

        reason.Text = text;
        reason.VisibilityLevel = request.VisibilityLevel;
        reason.UnlockDate = request.UnlockDate;
        reason.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<ReasonResponse>.Success(MapReason(reason, context));
    }

    public async Task<ContentServiceResult<bool>> DeleteReasonAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var reason = await _dbContext.Reasons
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (reason is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Reason was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(reason.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete reasons you created.");
        }

        _dbContext.Reasons.Remove(reason);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<ContentServiceResult<ReasonReactionResponse>> AddReactionAsync(
        Guid id,
        ReasonReactionRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ReasonReactionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var reason = await GetCoupleReasonsQuery(context.CoupleId!.Value)
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

        if (reason is null || !CanView(reason, context))
        {
            return ContentServiceResult<ReasonReactionResponse>.Failure(ContentServiceStatus.NotFound, "Reason was not found.");
        }

        var alreadyReacted = reason.Reactions.Any(reaction =>
            reaction.UserId == context.UserId!.Value && reaction.ReactionType == request.Type);

        if (alreadyReacted)
        {
            return ContentServiceResult<ReasonReactionResponse>.Failure(
                ContentServiceStatus.BadRequest,
                "You already added this reaction.");
        }

        var reaction = new ReasonReaction
        {
            Id = Guid.NewGuid(),
            ReasonId = reason.Id,
            CoupleId = context.CoupleId.Value,
            UserId = context.UserId!.Value,
            ReactionType = request.Type,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.ReasonReactions.Add(reaction);
        await _dbContext.SaveChangesAsync(cancellationToken);

        reason.Reactions.Add(reaction);
        return ContentServiceResult<ReasonReactionResponse>.Success(MapReactionSummary(reason, request.Type, context.UserId.Value));
    }

    public async Task<ContentServiceResult<bool>> DeleteReactionAsync(
        Guid id,
        ReactionType type,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var reason = await _dbContext.Reasons
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (reason is null || !CanView(reason, context))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Reason was not found.");
        }

        var reaction = await _dbContext.ReasonReactions
            .FirstOrDefaultAsync(candidate =>
                candidate.ReasonId == id
                && candidate.CoupleId == context.CoupleId
                && candidate.UserId == context.UserId
                && candidate.ReactionType == type,
                cancellationToken);

        if (reaction is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Reaction was not found.");
        }

        _dbContext.ReasonReactions.Remove(reaction);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    private async Task<ContentServiceResult<IReadOnlyList<ReasonResponse>>> GetUnlockedVisibleReasonsAsync(
        CancellationToken cancellationToken)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<ReasonResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var reasons = await GetCoupleReasonsQuery(context.CoupleId!.Value)
            .OrderBy(reason => reason.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = reasons
            .Where(reason => ContentVisibility.IsUnlocked(reason.UnlockDate))
            .Where(reason => CanView(reason, context))
            .Select(reason => MapReason(reason, context))
            .ToList();

        return ContentServiceResult<IReadOnlyList<ReasonResponse>>.Success(responses);
    }

    private IQueryable<Reason> GetCoupleReasonsQuery(Guid coupleId)
    {
        return _dbContext.Reasons
            .AsNoTracking()
            .Include(reason => reason.CreatedByUser)
            .Include(reason => reason.Reactions)
            .Where(reason => reason.CoupleId == coupleId);
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

    private static bool CanView(Reason reason, ContentContext context)
    {
        return ContentVisibility.CanView(
            reason.VisibilityLevel,
            reason.CreatedByUserId,
            context.UserId!.Value,
            context.Role!.Value,
            reason.UnlockDate);
    }

    private static ReasonResponse MapReason(Reason reason, ContentContext context)
    {
        return new ReasonResponse
        {
            Id = reason.Id,
            Text = reason.Text,
            VisibilityLevel = reason.VisibilityLevel,
            UnlockDate = reason.UnlockDate,
            CreatedByUserId = reason.CreatedByUserId,
            CreatedByDisplayName = reason.CreatedByUser.DisplayName ?? reason.CreatedByUser.Username,
            CreatedAt = reason.CreatedAt,
            UpdatedAt = reason.UpdatedAt,
            Reactions = reason.Reactions
                .GroupBy(reaction => reaction.ReactionType)
                .OrderBy(group => group.Key.ToString())
                .Select(group => new ReasonReactionResponse
                {
                    Type = group.Key,
                    Count = group.Count(),
                    CurrentUserReacted = group.Any(reaction => reaction.UserId == context.UserId!.Value)
                })
                .ToList()
        };
    }

    private static ReasonReactionResponse MapReactionSummary(Reason reason, ReactionType type, Guid currentUserId)
    {
        var reactions = reason.Reactions.Where(reaction => reaction.ReactionType == type).ToList();
        return new ReasonReactionResponse
        {
            Type = type,
            Count = reactions.Count,
            CurrentUserReacted = reactions.Any(reaction => reaction.UserId == currentUserId)
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
