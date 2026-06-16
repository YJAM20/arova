using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Challenges;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class ChallengeService : IChallengeService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public ChallengeService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<ChallengeResponse>>> GetChallengesAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<ChallengeResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var challenges = await _dbContext.Challenges
            .AsNoTracking()
            .Include(challenge => challenge.CreatedByUser)
            .Include(challenge => challenge.Completions)
                .ThenInclude(completion => completion.User)
            .Where(challenge => challenge.CoupleId == context.CoupleId)
            .OrderByDescending(challenge => challenge.CreatedAt)
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<ChallengeResponse>>.Success(
            challenges.Select(challenge => MapChallenge(challenge, context.UserId!.Value)).ToList());
    }

    public async Task<ContentServiceResult<ChallengeResponse>> GetDailyChallengeAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var now = DateTime.UtcNow;
        var challenges = await _dbContext.Challenges
            .AsNoTracking()
            .Include(challenge => challenge.CreatedByUser)
            .Include(challenge => challenge.Completions)
                .ThenInclude(completion => completion.User)
            .Where(challenge => challenge.CoupleId == context.CoupleId)
            .ToListAsync(cancellationToken);

        var dailyChallenge = challenges
            .Where(challenge => (!challenge.StartsAt.HasValue || challenge.StartsAt.Value <= now)
                && (!challenge.EndsAt.HasValue || challenge.EndsAt.Value >= now))
            .OrderByDescending(challenge => challenge.StartsAt ?? challenge.CreatedAt)
            .ThenByDescending(challenge => challenge.CreatedAt)
            .FirstOrDefault();

        if (dailyChallenge is null)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(ContentServiceStatus.NotFound, "Daily challenge was not found.");
        }

        return ContentServiceResult<ChallengeResponse>.Success(MapChallenge(dailyChallenge, context.UserId!.Value));
    }

    public async Task<ContentServiceResult<ChallengeResponse>> CreateChallengeAsync(
        ChallengeCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var validationError = ValidateChallengeRequest(request.Title, request.StartsAt, request.EndsAt);
        if (validationError is not null)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(ContentServiceStatus.BadRequest, validationError);
        }

        var challenge = new Challenge
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = request.Title.Trim(),
            Description = CleanOptional(request.Description),
            StartsAt = request.StartsAt,
            EndsAt = request.EndsAt,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Challenges.Add(challenge);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.Challenges
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .Include(candidate => candidate.Completions)
                .ThenInclude(completion => completion.User)
            .FirstAsync(candidate => candidate.Id == challenge.Id, cancellationToken);

        return ContentServiceResult<ChallengeResponse>.Success(MapChallenge(created, context.UserId.Value));
    }

    public async Task<ContentServiceResult<ChallengeResponse>> UpdateChallengeAsync(
        Guid id,
        ChallengeUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var challenge = await _dbContext.Challenges
            .Include(candidate => candidate.CreatedByUser)
            .Include(candidate => candidate.Completions)
                .ThenInclude(completion => completion.User)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (challenge is null)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(ContentServiceStatus.NotFound, "Challenge was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(challenge.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<ChallengeResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit challenges you created.");
        }

        var validationError = ValidateChallengeRequest(request.Title, request.StartsAt, request.EndsAt);
        if (validationError is not null)
        {
            return ContentServiceResult<ChallengeResponse>.Failure(ContentServiceStatus.BadRequest, validationError);
        }

        challenge.Title = request.Title.Trim();
        challenge.Description = CleanOptional(request.Description);
        challenge.StartsAt = request.StartsAt;
        challenge.EndsAt = request.EndsAt;
        challenge.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<ChallengeResponse>.Success(MapChallenge(challenge, context.UserId!.Value));
    }

    public async Task<ContentServiceResult<bool>> DeleteChallengeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var challenge = await _dbContext.Challenges
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (challenge is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Challenge was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(challenge.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete challenges you created.");
        }

        _dbContext.Challenges.Remove(challenge);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<ContentServiceResult<ChallengeCompletionResponse>> CompleteChallengeAsync(
        Guid id,
        ChallengeCompleteRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ChallengeCompletionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var challengeExists = await _dbContext.Challenges
            .AsNoTracking()
            .AnyAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (!challengeExists)
        {
            return ContentServiceResult<ChallengeCompletionResponse>.Failure(ContentServiceStatus.NotFound, "Challenge was not found.");
        }

        var alreadyCompleted = await _dbContext.ChallengeCompletions
            .AsNoTracking()
            .AnyAsync(
                completion => completion.ChallengeId == id
                    && completion.UserId == context.UserId,
                cancellationToken);

        if (alreadyCompleted)
        {
            return ContentServiceResult<ChallengeCompletionResponse>.Failure(
                ContentServiceStatus.BadRequest,
                "You already completed this challenge.");
        }

        var now = DateTime.UtcNow;
        var completion = new ChallengeCompletion
        {
            Id = Guid.NewGuid(),
            ChallengeId = id,
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            CompletedAt = now,
            Note = CleanOptional(request.Note),
            CreatedAt = now
        };

        _dbContext.ChallengeCompletions.Add(completion);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.ChallengeCompletions
            .AsNoTracking()
            .Include(candidate => candidate.User)
            .FirstAsync(candidate => candidate.Id == completion.Id, cancellationToken);

        return ContentServiceResult<ChallengeCompletionResponse>.Success(MapCompletion(created));
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

    private static string? ValidateChallengeRequest(string title, DateTime? startsAt, DateTime? endsAt)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            return "Challenge title is required.";
        }

        if (startsAt.HasValue && endsAt.HasValue && startsAt.Value > endsAt.Value)
        {
            return "Challenge start time must be before the end time.";
        }

        return null;
    }

    private static ChallengeResponse MapChallenge(Challenge challenge, Guid currentUserId)
    {
        var completions = challenge.Completions
            .OrderByDescending(completion => completion.CompletedAt)
            .Select(MapCompletion)
            .ToList();

        return new ChallengeResponse
        {
            Id = challenge.Id,
            Title = challenge.Title,
            Description = challenge.Description,
            StartsAt = challenge.StartsAt,
            EndsAt = challenge.EndsAt,
            CreatedByUserId = challenge.CreatedByUserId,
            CreatedByDisplayName = challenge.CreatedByUser.DisplayName ?? challenge.CreatedByUser.Username,
            IsCompletedByCurrentUser = challenge.Completions.Any(completion => completion.UserId == currentUserId),
            CompletionCount = completions.Count,
            Completions = completions,
            CreatedAt = challenge.CreatedAt,
            UpdatedAt = challenge.UpdatedAt
        };
    }

    private static ChallengeCompletionResponse MapCompletion(ChallengeCompletion completion)
    {
        return new ChallengeCompletionResponse
        {
            Id = completion.Id,
            ChallengeId = completion.ChallengeId,
            UserId = completion.UserId,
            UserDisplayName = completion.User.DisplayName ?? completion.User.Username,
            CompletedAt = completion.CompletedAt,
            Note = completion.Note,
            CreatedAt = completion.CreatedAt
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
