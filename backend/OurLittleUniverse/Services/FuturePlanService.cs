using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.FuturePlans;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class FuturePlanService : IFuturePlanService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public FuturePlanService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<FuturePlanResponse>>> GetFuturePlansAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<FuturePlanResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var plans = await _dbContext.FuturePlans
            .AsNoTracking()
            .Include(plan => plan.CreatedByUser)
            .Where(plan => plan.CoupleId == context.CoupleId)
            .OrderBy(plan => plan.IsCompleted)
            .ThenBy(plan => plan.PlannedFor ?? DateTime.MaxValue)
            .ThenByDescending(plan => plan.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = plans
            .Where(plan => CanView(plan, context))
            .Select(MapPlan)
            .ToList();

        return ContentServiceResult<IReadOnlyList<FuturePlanResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<FuturePlanResponse>> GetFuturePlanAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var plan = await _dbContext.FuturePlans
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (plan is null || !CanView(plan, context))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.NotFound, "Future plan was not found.");
        }

        return ContentServiceResult<FuturePlanResponse>.Success(MapPlan(plan));
    }

    public async Task<ContentServiceResult<FuturePlanResponse>> CreateFuturePlanAsync(
        FuturePlanCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.BadRequest, "Future plan title is required.");
        }

        var plan = new FuturePlan
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = title,
            Description = CleanOptional(request.Description),
            PlannedFor = request.PlannedFor,
            VisibilityLevel = request.VisibilityLevel,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.FuturePlans.Add(plan);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.FuturePlans
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstAsync(candidate => candidate.Id == plan.Id, cancellationToken);

        return ContentServiceResult<FuturePlanResponse>.Success(MapPlan(created));
    }

    public async Task<ContentServiceResult<FuturePlanResponse>> UpdateFuturePlanAsync(
        Guid id,
        FuturePlanUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var plan = await _dbContext.FuturePlans
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (plan is null || !CanView(plan, context))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.NotFound, "Future plan was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(plan.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit future plans you created.");
        }

        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.BadRequest, "Future plan title is required.");
        }

        var now = DateTime.UtcNow;
        plan.Title = title;
        plan.Description = CleanOptional(request.Description);
        plan.PlannedFor = request.PlannedFor;
        plan.VisibilityLevel = request.VisibilityLevel;
        plan.CompletedAt = request.IsCompleted
            ? plan.CompletedAt ?? now
            : null;
        plan.IsCompleted = request.IsCompleted;
        plan.UpdatedAt = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<FuturePlanResponse>.Success(MapPlan(plan));
    }

    public async Task<ContentServiceResult<bool>> DeleteFuturePlanAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var plan = await _dbContext.FuturePlans
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (plan is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Future plan was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(plan.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete future plans you created.");
        }

        _dbContext.FuturePlans.Remove(plan);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<ContentServiceResult<FuturePlanResponse>> MarkDoneAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var plan = await _dbContext.FuturePlans
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (plan is null || !CanView(plan, context))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.NotFound, "Future plan was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(plan.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<FuturePlanResponse>.Failure(ContentServiceStatus.Forbidden, "You can only update future plans you created.");
        }

        var now = DateTime.UtcNow;
        plan.IsCompleted = true;
        plan.CompletedAt ??= now;
        plan.UpdatedAt = now;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<FuturePlanResponse>.Success(MapPlan(plan));
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

    private static bool CanView(FuturePlan plan, AccessContext context)
    {
        return ContentVisibility.CanView(
            plan.VisibilityLevel,
            plan.CreatedByUserId,
            context.UserId!.Value,
            context.Role!.Value);
    }

    private static FuturePlanResponse MapPlan(FuturePlan plan)
    {
        return new FuturePlanResponse
        {
            Id = plan.Id,
            Title = plan.Title,
            Description = plan.Description,
            PlannedFor = plan.PlannedFor,
            IsCompleted = plan.IsCompleted,
            Status = plan.IsCompleted ? "Done" : "Planned",
            CompletedAt = plan.CompletedAt,
            VisibilityLevel = plan.VisibilityLevel,
            CreatedByUserId = plan.CreatedByUserId,
            CreatedByDisplayName = plan.CreatedByUser.DisplayName ?? plan.CreatedByUser.Username,
            CreatedAt = plan.CreatedAt,
            UpdatedAt = plan.UpdatedAt
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
