using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.RelationshipScore;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using LoveUniverse.Api.Hubs;

namespace LoveUniverse.Api.Services;

public sealed class RelationshipScoreService : IRelationshipScoreService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IHubContext<CoupleHub> _hubContext;

    private static readonly (string Rank, int Threshold)[] Ranks = new[]
    {
        ("Spark", 0),
        ("Warmth", 100),
        ("Orbit", 250),
        ("Bond", 500),
        ("Constellation", 1000),
        ("Gravity", 1750),
        ("Eclipse", 3000),
        ("Eternal Orbit", 5000)
    };

    private static readonly (string Key, string Title, string Description, int Points)[] DailyTaskTemplates = new[]
    {
        ("send_kind_message", "Send a kind message", "Send a kind or encouraging message to your partner.", 10),
        ("share_memory", "Share a memory together", "Post a memory or upload a photo of a special moment.", 15),
        ("write_reason", "Write a reason you appreciate them", "Write down a reason why you appreciate your partner.", 10),
        ("mood_check", "Check in on your mood", "Update your mood status so your partner knows how you feel.", 5),
        ("plan_something", "Plan something for the future", "Create a new future plan or bucket list item.", 15),
        ("say_thank_you", "Say thank you for something specific", "Express gratitude for something nice your partner did.", 10),
        ("surprise_note", "Leave a surprise note", "Leave a sweet, unexpected note or letter for your partner.", 15),
        ("recall_memory", "Talk about a favorite memory", "Reminisce about one of your favorite shared memories.", 10),
        ("compliment", "Give a genuine compliment", "Give your partner a sincere and heartfelt compliment.", 5),
        ("listen_song", "Listen to a song together", "Add a song to your shared music library and listen to it.", 10),
        ("ask_question", "Ask a meaningful question", "Ask your partner a deep or interesting question to learn more about them.", 10),
        ("share_dream", "Share a dream or wish", "Share a personal dream, goal, or wish for the future.", 15),
        ("small_gesture", "Do a small kind gesture", "Perform a small act of kindness or help out with something.", 10),
        ("reflect_together", "Reflect on your week together", "Take a few minutes to talk about how your week went.", 15),
        ("celebrate_win", "Celebrate a small win together", "Acknowledge and celebrate a recent success or milestone.", 10)
    };

    public RelationshipScoreService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IHubContext<CoupleHub> hubContext)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _hubContext = hubContext;
    }

    public async Task<ContentServiceResult<RelationshipScoreResponse>> GetScoreAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<RelationshipScoreResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var totalPoints = await _dbContext.Set<RelationshipPointLedger>()
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == context.CoupleId)
            .SumAsync(ledger => ledger.Points, cancellationToken);

        string currentRank = "Spark";
        int currentThreshold = 0;
        string? nextRank = null;
        int nextRankThreshold = 5000;
        double progressPercent = 100.0;

        for (int i = 0; i < Ranks.Length; i++)
        {
            if (totalPoints >= Ranks[i].Threshold)
            {
                currentRank = Ranks[i].Rank;
                currentThreshold = Ranks[i].Threshold;
            }
        }

        for (int i = 0; i < Ranks.Length; i++)
        {
            if (Ranks[i].Threshold > totalPoints)
            {
                nextRank = Ranks[i].Rank;
                nextRankThreshold = Ranks[i].Threshold;
                break;
            }
        }

        if (nextRank is not null)
        {
            int range = nextRankThreshold - currentThreshold;
            int progress = totalPoints - currentThreshold;
            progressPercent = range > 0 ? (double)progress / range * 100.0 : 100.0;
        }

        // Compute streak: consecutive calendar days (UTC) with at least one ledger entry, ending today or yesterday
        var distinctDates = await _dbContext.Set<RelationshipPointLedger>()
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == context.CoupleId)
            .Select(ledger => ledger.CreatedAt.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync(cancellationToken);

        int streak = 0;
        if (distinctDates.Count > 0)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);
            // Streak is valid if the most recent active day is today or yesterday
            var mostRecent = distinctDates[0];
            if (mostRecent == today || mostRecent == yesterday)
            {
                var expected = mostRecent;
                foreach (var date in distinctDates)
                {
                    if (date == expected)
                    {
                        streak++;
                        expected = expected.AddDays(-1);
                    }
                    else
                    {
                        break;
                    }
                }
            }
        }

        return ContentServiceResult<RelationshipScoreResponse>.Success(new RelationshipScoreResponse
        {
            TotalPoints = totalPoints,
            CurrentRank = currentRank,
            NextRank = nextRank,
            NextRankThreshold = nextRankThreshold,
            ProgressPercent = Math.Round(progressPercent, 2),
            Streak = streak
        });
    }

    public async Task<ContentServiceResult<IReadOnlyList<PointLedgerEntryResponse>>> GetLedgerAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<PointLedgerEntryResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var entries = await _dbContext.Set<RelationshipPointLedger>()
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == context.CoupleId)
            .OrderByDescending(ledger => ledger.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);

        var response = entries.Select(MapLedgerEntry).ToList();
        return ContentServiceResult<IReadOnlyList<PointLedgerEntryResponse>>.Success(response);
    }

    public async Task<ContentServiceResult<IReadOnlyList<DailyTaskResponse>>> GetDailyTasksAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<DailyTaskResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await EnsureDailyTasksAsync(context.CoupleId!.Value, today, cancellationToken);

        var tasks = await _dbContext.Set<RelationshipDailyTask>()
            .AsNoTracking()
            .Where(task => task.CoupleId == context.CoupleId && task.Date == today)
            .OrderBy(task => task.TaskKey)
            .ToListAsync(cancellationToken);

        var response = tasks.Select(MapDailyTask).ToList();
        return ContentServiceResult<IReadOnlyList<DailyTaskResponse>>.Success(response);
    }

    public async Task<ContentServiceResult<DailyTaskResponse>> CompleteDailyTaskAsync(Guid taskId, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyTaskResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var task = await _dbContext.Set<RelationshipDailyTask>()
            .FirstOrDefaultAsync(t => t.Id == taskId && t.CoupleId == context.CoupleId, cancellationToken);

        if (task is null)
        {
            return ContentServiceResult<DailyTaskResponse>.Failure(ContentServiceStatus.NotFound, "Daily task not found.");
        }

        if (task.IsCompleted)
        {
            return ContentServiceResult<DailyTaskResponse>.Failure(ContentServiceStatus.BadRequest, "Daily task already completed.");
        }

        var oldState = await GetScoreStateAsync(context.CoupleId!.Value, cancellationToken);

        var now = DateTime.UtcNow;
        task.IsCompleted = true;
        task.CompletedByUserId = context.UserId;
        task.CompletedAt = now;

        var ledgerEntry = new RelationshipPointLedger
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            ActionType = "daily_task_completion",
            Points = task.PointsReward,
            Reason = $"Completed daily task: {task.Title}",
            SourceType = "DailyTask",
            SourceId = task.Id,
            CreatedAt = now
        };

        _dbContext.Set<RelationshipPointLedger>().Add(ledgerEntry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var newState = await GetScoreStateAsync(context.CoupleId!.Value, cancellationToken);

        string userDisplayName = "Partner";
        var user = await _dbContext.AppUsers.FindAsync(new object[] { context.UserId!.Value }, cancellationToken);
        if (user != null)
        {
            userDisplayName = user.DisplayName ?? user.Username;
        }

        await EmitGamificationEventsAsync(context.CoupleId!.Value, userDisplayName, ledgerEntry.Reason, ledgerEntry.Points, oldState, newState, cancellationToken);

        return ContentServiceResult<DailyTaskResponse>.Success(MapDailyTask(task));
    }

    public async Task<ContentServiceResult<AwardPointsResponse>> AwardPointsAsync(AwardPointsRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<AwardPointsResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (string.IsNullOrWhiteSpace(request.ActionType))
        {
            return ContentServiceResult<AwardPointsResponse>.Failure(ContentServiceStatus.BadRequest, "ActionType is required.");
        }

        if (request.Points <= 0)
        {
            return ContentServiceResult<AwardPointsResponse>.Failure(ContentServiceStatus.BadRequest, "Points must be greater than zero.");
        }

        if (request.Points > 500)
        {
            return ContentServiceResult<AwardPointsResponse>.Failure(ContentServiceStatus.BadRequest, "Points per award cannot exceed 500.");
        }

        var oldState = await GetScoreStateAsync(context.CoupleId!.Value, cancellationToken);

        var now = DateTime.UtcNow;
        var ledgerEntry = new RelationshipPointLedger
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            ActionType = request.ActionType.Trim(),
            Points = request.Points,
            Reason = (request.Reason ?? string.Empty).Trim(),
            SourceType = request.SourceType?.Trim(),
            CreatedAt = now
        };

        _dbContext.Set<RelationshipPointLedger>().Add(ledgerEntry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var newState = await GetScoreStateAsync(context.CoupleId!.Value, cancellationToken);

        string userDisplayName = "Partner";
        var user = await _dbContext.AppUsers.FindAsync(new object[] { context.UserId!.Value }, cancellationToken);
        if (user != null)
        {
            userDisplayName = user.DisplayName ?? user.Username;
        }

        await EmitGamificationEventsAsync(context.CoupleId!.Value, userDisplayName, ledgerEntry.ActionType, ledgerEntry.Points, oldState, newState, cancellationToken);

        return ContentServiceResult<AwardPointsResponse>.Success(new AwardPointsResponse
        {
            Id = ledgerEntry.Id,
            UserId = ledgerEntry.UserId,
            ActionType = ledgerEntry.ActionType,
            Points = ledgerEntry.Points,
            Reason = ledgerEntry.Reason,
            SourceType = ledgerEntry.SourceType,
            CreatedAt = ledgerEntry.CreatedAt,
            NewTotalPoints = newState.Points
        });
    }

    private async Task EnsureDailyTasksAsync(Guid coupleId, DateOnly date, CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Set<RelationshipDailyTask>()
            .AnyAsync(task => task.CoupleId == coupleId && task.Date == date, cancellationToken);

        if (exists)
        {
            return;
        }

        var dateStr = date.ToString("yyyyMMdd");
        var seedSource = $"{coupleId}_{dateStr}";
        
        int seed = 0;
        foreach (char c in seedSource)
        {
            seed = (seed * 31) + c;
        }
        var random = new Random(seed);

        var templates = DailyTaskTemplates.ToList();
        for (int i = templates.Count - 1; i > 0; i--)
        {
            int j = random.Next(i + 1);
            var temp = templates[i];
            templates[i] = templates[j];
            templates[j] = temp;
        }

        var selected = templates.Take(5).ToList();
        var now = DateTime.UtcNow;

        foreach (var t in selected)
        {
            var task = new RelationshipDailyTask
            {
                Id = Guid.NewGuid(),
                CoupleId = coupleId,
                TaskKey = t.Key,
                Title = t.Title,
                Description = t.Description,
                PointsReward = t.Points,
                Date = date,
                IsCompleted = false,
                CreatedAt = now
            };
            _dbContext.Set<RelationshipDailyTask>().Add(task);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
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

    private static PointLedgerEntryResponse MapLedgerEntry(RelationshipPointLedger entry)
    {
        return new PointLedgerEntryResponse
        {
            Id = entry.Id,
            UserId = entry.UserId,
            ActionType = entry.ActionType,
            Points = entry.Points,
            Reason = entry.Reason,
            SourceType = entry.SourceType,
            CreatedAt = entry.CreatedAt
        };
    }

    private static DailyTaskResponse MapDailyTask(RelationshipDailyTask task)
    {
        return new DailyTaskResponse
        {
            Id = task.Id,
            TaskKey = task.TaskKey,
            Title = task.Title,
            Description = task.Description,
            PointsReward = task.PointsReward,
            Date = task.Date,
            IsCompleted = task.IsCompleted,
            CompletedAt = task.CompletedAt
        };
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

    private async Task<(int Points, int Streak, string Rank)> GetScoreStateAsync(Guid coupleId, CancellationToken cancellationToken)
    {
        var totalPoints = await _dbContext.Set<RelationshipPointLedger>()
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == coupleId)
            .SumAsync(ledger => ledger.Points, cancellationToken);

        string currentRank = "Spark";
        for (int i = 0; i < Ranks.Length; i++)
        {
            if (totalPoints >= Ranks[i].Threshold)
            {
                currentRank = Ranks[i].Rank;
            }
        }

        var distinctDates = await _dbContext.Set<RelationshipPointLedger>()
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == coupleId)
            .Select(ledger => ledger.CreatedAt.Date)
            .Distinct()
            .OrderByDescending(d => d)
            .ToListAsync(cancellationToken);

        int streak = 0;
        if (distinctDates.Count > 0)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);
            var mostRecent = distinctDates[0];
            if (mostRecent == today || mostRecent == yesterday)
            {
                var expected = mostRecent;
                foreach (var date in distinctDates)
                {
                    if (date == expected)
                    {
                        streak++;
                        expected = expected.AddDays(-1);
                    }
                    else
                    {
                        break;
                    }
                }
            }
        }

        return (totalPoints, streak, currentRank);
    }

    private async Task EmitGamificationEventsAsync(
        Guid coupleId,
        string userDisplayName,
        string actionType,
        int points,
        (int Points, int Streak, string Rank) oldState,
        (int Points, int Streak, string Rank) newState,
        CancellationToken cancellationToken)
    {
        var groupName = $"couple-{coupleId}";

        await _hubContext.Clients.Group(groupName).SendAsync("pointsAwarded", new
        {
            userDisplayName,
            actionType,
            points,
            newTotal = newState.Points,
            rank = newState.Rank
        }, cancellationToken);

        if (newState.Streak > oldState.Streak)
        {
            await _hubContext.Clients.Group(groupName).SendAsync("streakMilestone", new
            {
                userDisplayName,
                streak = newState.Streak
            }, cancellationToken);
        }

        if (newState.Rank != oldState.Rank)
        {
            await _hubContext.Clients.Group(groupName).SendAsync("rankChanged", new
            {
                userDisplayName,
                rank = newState.Rank,
                newTotal = newState.Points
            }, cancellationToken);
        }
    }
}
