using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.CoupleGoals;
using LoveUniverse.Api.DTOs.RelationshipScore;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class CoupleGoalService : ICoupleGoalService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IRelationshipScoreService _relationshipScoreService;

    public CoupleGoalService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IRelationshipScoreService relationshipScoreService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _relationshipScoreService = relationshipScoreService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<CoupleGoalResponse>>> GetGoalsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<CoupleGoalResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var goals = await _dbContext.CoupleGoals
            .Include(g => g.CreatedByUser)
            .Include(g => g.Milestones)
            .Where(g => g.CoupleId == context.CoupleId)
            .OrderBy(g => g.Status == "completed")
            .ThenByDescending(g => g.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = goals
            .Where(g => CanView(g, context))
            .Select(g => MapGoal(g))
            .ToList();

        return ContentServiceResult<IReadOnlyList<CoupleGoalResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<CoupleGoalResponse>> GetGoalByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .Include(g => g.CreatedByUser)
            .Include(g => g.Milestones)
            .FirstOrDefaultAsync(g => g.Id == id && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null || !CanView(goal, context))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        return ContentServiceResult<CoupleGoalResponse>.Success(MapGoal(goal));
    }

    public async Task<ContentServiceResult<CoupleGoalResponse>> CreateGoalAsync(
        CoupleGoalCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.BadRequest, "Goal title is required.");
        }

        var now = DateTime.UtcNow;
        var status = CleanStatus(request.Status);
        var goal = new CoupleGoal
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = title,
            Description = CleanOptional(request.Description),
            Category = CleanCategory(request.Category),
            Status = status,
            TargetDate = request.TargetDate,
            IsPrivate = request.IsPrivate,
            CreatedAt = now,
            ProgressPercent = status == "completed" ? 100.0 : Math.Clamp(request.ProgressPercent ?? 0.0, 0.0, 100.0),
            CompletedAt = status == "completed" ? now : null
        };

        _dbContext.CoupleGoals.Add(goal);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // Fetch to ensure display name mapping
        var created = await _dbContext.CoupleGoals
            .Include(g => g.CreatedByUser)
            .Include(g => g.Milestones)
            .FirstAsync(g => g.Id == goal.Id, cancellationToken);

        // Gamification award
        await AwardPointsSafelyAsync("goal-created", 15, $"Created goal: {created.Title}", "CoupleGoal", cancellationToken);

        if (created.Status == "completed")
        {
            await AwardPointsSafelyAsync("goal-completed", 30, $"Completed goal: {created.Title}", "CoupleGoal", cancellationToken);
        }

        return ContentServiceResult<CoupleGoalResponse>.Success(MapGoal(created));
    }

    public async Task<ContentServiceResult<CoupleGoalResponse>> UpdateGoalAsync(
        Guid id,
        CoupleGoalUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .Include(g => g.CreatedByUser)
            .Include(g => g.Milestones)
            .FirstOrDefaultAsync(g => g.Id == id && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null || !CanView(goal, context))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        // Ownership checks for editing
        if (!await _permissionService.CanEditContentAsync(goal.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit goals you created.");
        }

        var title = request.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.BadRequest, "Goal title is required.");
        }

        var wasCompleted = goal.Status == "completed";
        var newStatus = CleanStatus(request.Status);
        var now = DateTime.UtcNow;

        goal.Title = title;
        goal.Description = CleanOptional(request.Description);
        goal.Category = CleanCategory(request.Category);
        goal.Status = newStatus;
        goal.TargetDate = request.TargetDate;
        goal.IsPrivate = request.IsPrivate;
        goal.UpdatedAt = now;

        if (newStatus == "completed")
        {
            goal.CompletedAt ??= now;
        }
        else
        {
            goal.CompletedAt = null;
        }

        // Recompute progress
        RecalculateProgress(goal, request.ProgressPercent);

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Gamification completion award
        if (!wasCompleted && goal.Status == "completed")
        {
            await AwardPointsSafelyAsync("goal-completed", 30, $"Completed goal: {goal.Title}", "CoupleGoal", cancellationToken);
        }

        return ContentServiceResult<CoupleGoalResponse>.Success(MapGoal(goal));
    }

    public async Task<ContentServiceResult<bool>> DeleteGoalAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .FirstOrDefaultAsync(g => g.Id == id && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(goal.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete goals you created.");
        }

        _dbContext.CoupleGoals.Remove(goal);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<ContentServiceResult<CoupleGoalResponse>> CompleteGoalAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .Include(g => g.CreatedByUser)
            .Include(g => g.Milestones)
            .FirstOrDefaultAsync(g => g.Id == id && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null || !CanView(goal, context))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(goal.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<CoupleGoalResponse>.Failure(ContentServiceStatus.Forbidden, "You can only complete goals you created.");
        }

        if (goal.Status == "completed")
        {
            return ContentServiceResult<CoupleGoalResponse>.Success(MapGoal(goal));
        }

        var now = DateTime.UtcNow;
        goal.Status = "completed";
        goal.CompletedAt = now;
        goal.UpdatedAt = now;
        goal.ProgressPercent = 100.0;

        // Mark all milestones completed as well
        foreach (var milestone in goal.Milestones)
        {
            if (!milestone.IsCompleted)
            {
                milestone.IsCompleted = true;
                milestone.CompletedAt = now;
                milestone.UpdatedAt = now;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        await AwardPointsSafelyAsync("goal-completed", 30, $"Completed goal: {goal.Title}", "CoupleGoal", cancellationToken);

        return ContentServiceResult<CoupleGoalResponse>.Success(MapGoal(goal));
    }

    // ─── Milestones ─────────────────────────────────────────────────────────

    public async Task<ContentServiceResult<CoupleGoalMilestoneResponse>> CreateMilestoneAsync(
        Guid goalId,
        MilestoneCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .Include(g => g.Milestones)
            .FirstOrDefaultAsync(g => g.Id == goalId && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null || !CanView(goal, context))
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        // Only creator can manage milestones
        if (!await _permissionService.CanEditContentAsync(goal.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit goals you created.");
        }

        var title = request.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.BadRequest, "Milestone title is required.");
        }

        var milestone = new CoupleGoalMilestone
        {
            Id = Guid.NewGuid(),
            GoalId = goal.Id,
            Title = title,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.CoupleGoalMilestones.Add(milestone);
        goal.Milestones.Add(milestone);

        // Update progress
        RecalculateProgress(goal);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CoupleGoalMilestoneResponse>.Success(MapMilestone(milestone));
    }

    public async Task<ContentServiceResult<CoupleGoalMilestoneResponse>> UpdateMilestoneAsync(
        Guid goalId,
        Guid milestoneId,
        MilestoneUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .Include(g => g.Milestones)
            .FirstOrDefaultAsync(g => g.Id == goalId && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null || !CanView(goal, context))
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        // Only creator can manage milestones
        if (!await _permissionService.CanEditContentAsync(goal.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit goals you created.");
        }

        var milestone = goal.Milestones.FirstOrDefault(m => m.Id == milestoneId);
        if (milestone is null)
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.NotFound, "Milestone was not found.");
        }

        var title = request.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<CoupleGoalMilestoneResponse>.Failure(ContentServiceStatus.BadRequest, "Milestone title is required.");
        }

        var wasCompleted = milestone.IsCompleted;
        var now = DateTime.UtcNow;

        milestone.Title = title;
        milestone.IsCompleted = request.IsCompleted;
        milestone.UpdatedAt = now;

        if (request.IsCompleted)
        {
            milestone.CompletedAt ??= now;
        }
        else
        {
            milestone.CompletedAt = null;
        }

        // Recalculate goal progress
        var wasGoalCompleted = goal.Status == "completed";
        RecalculateProgress(goal);

        await _dbContext.SaveChangesAsync(cancellationToken);

        // Gamification awards
        if (!wasCompleted && milestone.IsCompleted)
        {
            await AwardPointsSafelyAsync("goal-milestone-completed", 5, $"Completed milestone: {milestone.Title}", "CoupleGoalMilestone", cancellationToken);
        }

        if (!wasGoalCompleted && goal.Status == "completed")
        {
            await AwardPointsSafelyAsync("goal-completed", 30, $"Completed goal: {goal.Title}", "CoupleGoal", cancellationToken);
        }

        return ContentServiceResult<CoupleGoalMilestoneResponse>.Success(MapMilestone(milestone));
    }

    public async Task<ContentServiceResult<bool>> DeleteMilestoneAsync(Guid goalId, Guid milestoneId, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var goal = await _dbContext.CoupleGoals
            .Include(g => g.Milestones)
            .FirstOrDefaultAsync(g => g.Id == goalId && g.CoupleId == context.CoupleId, cancellationToken);

        if (goal is null || !CanView(goal, context))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Goal was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(goal.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only edit goals you created.");
        }

        var milestone = goal.Milestones.FirstOrDefault(m => m.Id == milestoneId);
        if (milestone is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Milestone was not found.");
        }

        _dbContext.CoupleGoalMilestones.Remove(milestone);
        goal.Milestones.Remove(milestone);

        // Recalculate progress
        RecalculateProgress(goal);

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<bool>.Success(true);
    }

    // ─── Private Helpers ───────────────────────────────────────────────────

    private async Task<ContentContext> GetContentContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (coupleId is null || role is null)
        {
            return ContentContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return ContentContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static bool CanView(CoupleGoal goal, ContentContext context)
    {
        if (goal.IsPrivate)
        {
            return goal.CreatedByUserId == context.UserId;
        }
        return true;
    }

    private static void RecalculateProgress(CoupleGoal goal, double? manualProgress = null)
    {
        if (goal.Milestones.Any())
        {
            var completedCount = goal.Milestones.Count(m => m.IsCompleted);
            var totalCount = goal.Milestones.Count;
            goal.ProgressPercent = Math.Round((double)completedCount / totalCount * 100.0, 2);

            if (completedCount == totalCount && totalCount > 0)
            {
                if (goal.Status != "completed")
                {
                    goal.Status = "completed";
                    goal.CompletedAt = DateTime.UtcNow;
                }
            }
            else
            {
                if (goal.Status == "completed" || (completedCount > 0 && goal.Status == "not-started"))
                {
                    goal.Status = "in-progress";
                    goal.CompletedAt = null;
                }
            }
        }
        else
        {
            if (goal.Status == "completed")
            {
                goal.ProgressPercent = 100.0;
            }
            else
            {
                goal.ProgressPercent = Math.Clamp(manualProgress ?? goal.ProgressPercent, 0.0, 100.0);
            }
        }
    }

    private async Task AwardPointsSafelyAsync(string actionType, int points, string reason, string? sourceType, CancellationToken cancellationToken)
    {
        try
        {
            await _relationshipScoreService.AwardPointsAsync(new AwardPointsRequest
            {
                ActionType = actionType,
                Points = points,
                Reason = reason,
                SourceType = sourceType
            }, cancellationToken);
        }
        catch
        {
            // Swallow points award failures to keep user flow intact
        }
    }

    private static CoupleGoalResponse MapGoal(CoupleGoal g)
    {
        return new CoupleGoalResponse
        {
            Id = g.Id,
            CoupleId = g.CoupleId,
            CreatedByUserId = g.CreatedByUserId,
            CreatedByDisplayName = g.CreatedByUser.DisplayName ?? g.CreatedByUser.Username,
            Title = g.Title,
            Description = g.Description,
            Category = g.Category,
            Status = g.Status,
            TargetDate = g.TargetDate,
            ProgressPercent = g.ProgressPercent,
            IsPrivate = g.IsPrivate,
            CreatedAt = g.CreatedAt,
            UpdatedAt = g.UpdatedAt,
            CompletedAt = g.CompletedAt,
            Milestones = g.Milestones.Select(MapMilestone).ToList()
        };
    }

    private static CoupleGoalMilestoneResponse MapMilestone(CoupleGoalMilestone m)
    {
        return new CoupleGoalMilestoneResponse
        {
            Id = m.Id,
            GoalId = m.GoalId,
            Title = m.Title,
            IsCompleted = m.IsCompleted,
            CompletedAt = m.CompletedAt,
            CreatedAt = m.CreatedAt,
            UpdatedAt = m.UpdatedAt
        };
    }

    private static string CleanCategory(string? category)
    {
        var val = category?.Trim().ToLower();
        var valid = new[] { "relationship", "travel", "health", "finance", "creative", "home", "learning", "custom" };
        return valid.Contains(val) ? val! : "custom";
    }

    private static string CleanStatus(string? status)
    {
        var val = status?.Trim().ToLower();
        var valid = new[] { "not-started", "in-progress", "paused", "completed" };
        return valid.Contains(val) ? val! : "not-started";
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
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
