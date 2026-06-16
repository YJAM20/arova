using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.RelationshipScore;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class RelationshipScoreService : IRelationshipScoreService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

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

    public RelationshipScoreService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
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

        return ContentServiceResult<RelationshipScoreResponse>.Success(new RelationshipScoreResponse
        {
            TotalPoints = totalPoints,
            CurrentRank = currentRank,
            NextRank = nextRank,
            NextRankThreshold = nextRankThreshold,
            ProgressPercent = Math.Round(progressPercent, 2)
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

        return ContentServiceResult<DailyTaskResponse>.Success(MapDailyTask(task));
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
}
