using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Admin;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class AdminService : IAdminService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IDailyDigestService _dailyDigestService;

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

    public AdminService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IDailyDigestService dailyDigestService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _dailyDigestService = dailyDigestService;
    }

    public async Task<ContentServiceResult<AdminOverviewResponse>> GetOverviewAsync(CancellationToken cancellationToken = default)
    {
        var adminCheck = await CheckAdminAccessAsync(cancellationToken);
        if (!adminCheck.Succeeded)
        {
            return ContentServiceResult<AdminOverviewResponse>.Failure(adminCheck.Status, adminCheck.ErrorMessage);
        }

        var totalUsers = await _dbContext.AppUsers.CountAsync(cancellationToken);
        var totalCouples = await _dbContext.Couples.CountAsync(cancellationToken);
        var verifiedUsers = await _dbContext.AppUsers.CountAsync(user => user.IsVerified, cancellationToken);
        var unverifiedUsers = totalUsers - verifiedUsers;

        var totalMemories = await _dbContext.Memories.CountAsync(cancellationToken);
        var totalReasons = await _dbContext.Reasons.CountAsync(cancellationToken);
        var totalLetters = await _dbContext.Letters.CountAsync(cancellationToken);
        var totalChatMessages = await _dbContext.ChatMessages.CountAsync(cancellationToken);
        var feedbackCount = await _dbContext.FeedbackEntries.CountAsync(cancellationToken);

        var planDistribution = await _dbContext.CoupleSubscriptions
            .GroupBy(cs => cs.PlanType)
            .Select(g => new PlanDistributionEntry
            {
                PlanType = g.Key.ToString(),
                Count = g.Count()
            })
            .ToListAsync(cancellationToken);

        return ContentServiceResult<AdminOverviewResponse>.Success(new AdminOverviewResponse
        {
            TotalUsers = totalUsers,
            TotalCouples = totalCouples,
            VerifiedUsers = verifiedUsers,
            UnverifiedUsers = unverifiedUsers,
            TotalMemories = totalMemories,
            TotalReasons = totalReasons,
            TotalLetters = totalLetters,
            TotalChatMessages = totalChatMessages,
            FeedbackCount = feedbackCount,
            PlanDistribution = planDistribution,
            SystemHealth = "Healthy"
        });
    }

    public async Task<ContentServiceResult<IReadOnlyList<AdminFeedbackResponse>>> GetFeedbackAsync(CancellationToken cancellationToken = default)
    {
        var adminCheck = await CheckAdminAccessAsync(cancellationToken);
        if (!adminCheck.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<AdminFeedbackResponse>>.Failure(adminCheck.Status, adminCheck.ErrorMessage);
        }

        var feedback = await _dbContext.FeedbackEntries
            .AsNoTracking()
            .OrderByDescending(f => f.CreatedAt)
            .Take(100)
            .ToListAsync(cancellationToken);

        var responses = feedback.Select(MapFeedback).ToList();
        return ContentServiceResult<IReadOnlyList<AdminFeedbackResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<AdminHealthResponse>> GetHealthAsync(CancellationToken cancellationToken = default)
    {
        var adminCheck = await CheckAdminAccessAsync(cancellationToken);
        if (!adminCheck.Succeeded)
        {
            return ContentServiceResult<AdminHealthResponse>.Failure(adminCheck.Status, adminCheck.ErrorMessage);
        }

        var dbStatus = "Connected";
        int totalUsers = 0;
        int totalCouples = 0;

        try
        {
            totalUsers = await _dbContext.AppUsers.CountAsync(cancellationToken);
            totalCouples = await _dbContext.Couples.CountAsync(cancellationToken);
        }
        catch
        {
            dbStatus = "Error";
        }

        return ContentServiceResult<AdminHealthResponse>.Success(new AdminHealthResponse
        {
            Status = dbStatus == "Connected" ? "Healthy" : "Unhealthy",
            TotalUsers = totalUsers,
            TotalCouples = totalCouples,
            DatabaseStatus = dbStatus
        });
    }

    public async Task<ContentServiceResult<bool>> SendTestDailyDigestAsync(Guid coupleId, CancellationToken cancellationToken = default)
    {
        var adminCheck = await CheckAdminAccessAsync(cancellationToken);
        if (!adminCheck.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(adminCheck.Status, adminCheck.ErrorMessage);
        }

        var result = await _dailyDigestService.SendTestDailyDigestAsync(coupleId, cancellationToken);
        if (!result)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Couple not found or has no active members with emails.");
        }

        return ContentServiceResult<bool>.Success(true);
    }

    public async Task<ContentServiceResult<AdminEngagementOverviewDto>> GetEngagementAsync(Guid? coupleId, CancellationToken cancellationToken = default)
    {
        var adminCheck = await CheckAdminAccessAsync(cancellationToken);
        if (!adminCheck.Succeeded)
        {
            return ContentServiceResult<AdminEngagementOverviewDto>.Failure(adminCheck.Status, adminCheck.ErrorMessage);
        }

        Guid actualCoupleId;
        if (coupleId.HasValue && coupleId.Value != Guid.Empty)
        {
            actualCoupleId = coupleId.Value;
        }
        else
        {
            var myCoupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
            if (myCoupleId.HasValue)
            {
                actualCoupleId = myCoupleId.Value;
            }
            else
            {
                var firstCouple = await _dbContext.Couples.FirstOrDefaultAsync(c => c.IsActive, cancellationToken);
                if (firstCouple is null)
                {
                    return ContentServiceResult<AdminEngagementOverviewDto>.Failure(ContentServiceStatus.BadRequest, "No active couple found to analyze.");
                }
                actualCoupleId = firstCouple.Id;
            }
        }

        var totalMemories = await _dbContext.Memories.CountAsync(m => m.CoupleId == actualCoupleId, cancellationToken);
        var totalLetters = await _dbContext.Letters.CountAsync(l => l.CoupleId == actualCoupleId, cancellationToken);
        var totalReasons = await _dbContext.Reasons.CountAsync(r => r.CoupleId == actualCoupleId, cancellationToken);
        var totalMoodEntries = await _dbContext.MoodEntries.CountAsync(m => m.CoupleId == actualCoupleId, cancellationToken);
        var totalSongs = await _dbContext.Songs.CountAsync(s => s.CoupleId == actualCoupleId, cancellationToken);
        var totalGoals = await _dbContext.CoupleGoals.CountAsync(g => g.CoupleId == actualCoupleId, cancellationToken);
        var completedGoals = await _dbContext.CoupleGoals.CountAsync(g => g.CoupleId == actualCoupleId && g.Status == "completed", cancellationToken);

        // points, streak, rank
        var totalPoints = await _dbContext.RelationshipPointLedgers
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == actualCoupleId)
            .SumAsync(ledger => ledger.Points, cancellationToken);

        string currentRank = "Spark";
        for (int i = 0; i < Ranks.Length; i++)
        {
            if (totalPoints >= Ranks[i].Threshold)
            {
                currentRank = Ranks[i].Rank;
            }
        }

        var distinctDates = await _dbContext.RelationshipPointLedgers
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == actualCoupleId)
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

        // mostUsedFeature
        var features = new Dictionary<string, int>
        {
            { "Memories", totalMemories },
            { "Letters", totalLetters },
            { "Reasons", totalReasons },
            { "Moods", totalMoodEntries },
            { "Songs", totalSongs },
            { "Goals", totalGoals }
        };
        var mostUsedFeature = features.OrderByDescending(f => f.Value).FirstOrDefault().Key ?? "None";
        if (features.Values.All(v => v == 0))
        {
            mostUsedFeature = "None";
        }

        // lastActivityAt
        var dates = new List<DateTime>();
        var maxLedger = await _dbContext.RelationshipPointLedgers.Where(l => l.CoupleId == actualCoupleId).Select(l => (DateTime?)l.CreatedAt).MaxAsync(cancellationToken);
        if (maxLedger.HasValue) dates.Add(maxLedger.Value);
        var maxMemory = await _dbContext.Memories.Where(m => m.CoupleId == actualCoupleId).Select(m => (DateTime?)m.CreatedAt).MaxAsync(cancellationToken);
        if (maxMemory.HasValue) dates.Add(maxMemory.Value);
        var maxLetter = await _dbContext.Letters.Where(l => l.CoupleId == actualCoupleId).Select(l => (DateTime?)l.CreatedAt).MaxAsync(cancellationToken);
        if (maxLetter.HasValue) dates.Add(maxLetter.Value);
        var maxReason = await _dbContext.Reasons.Where(r => r.CoupleId == actualCoupleId).Select(r => (DateTime?)r.CreatedAt).MaxAsync(cancellationToken);
        if (maxReason.HasValue) dates.Add(maxReason.Value);
        var maxMood = await _dbContext.MoodEntries.Where(m => m.CoupleId == actualCoupleId).Select(m => (DateTime?)m.CreatedAt).MaxAsync(cancellationToken);
        if (maxMood.HasValue) dates.Add(maxMood.Value);
        var maxSong = await _dbContext.Songs.Where(s => s.CoupleId == actualCoupleId).Select(s => (DateTime?)s.CreatedAt).MaxAsync(cancellationToken);
        if (maxSong.HasValue) dates.Add(maxSong.Value);
        var maxGoal = await _dbContext.CoupleGoals.Where(g => g.CoupleId == actualCoupleId).Select(g => (DateTime?)g.CreatedAt).MaxAsync(cancellationToken);
        if (maxGoal.HasValue) dates.Add(maxGoal.Value);

        DateTime? lastActivityAt = dates.Count > 0 ? dates.Max() : null;

        // activityByDay last 7 days
        var cutoff = DateTime.UtcNow.Date.AddDays(-7);
        var dailyActivities = await _dbContext.RelationshipPointLedgers
            .Where(l => l.CoupleId == actualCoupleId && l.CreatedAt >= cutoff)
            .GroupBy(l => l.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var activityByDay = new Dictionary<string, int>();
        for (int i = 6; i >= 0; i--)
        {
            var day = DateTime.UtcNow.Date.AddDays(-i).ToString("yyyy-MM-dd");
            activityByDay[day] = 0;
        }
        foreach (var act in dailyActivities)
        {
            var key = act.Date.ToString("yyyy-MM-dd");
            activityByDay[key] = act.Count;
        }

        var limitations = new List<string>
        {
            "No End-to-End Encryption (E2EE) is active or claimed.",
            "Push notifications and billing are simulated previews only.",
            "Engagement summaries are aggregated on the backend and do not expose private content."
        };

        var result = new AdminEngagementOverviewDto
        {
            TotalMemories = totalMemories,
            TotalLetters = totalLetters,
            TotalReasons = totalReasons,
            TotalMoodEntries = totalMoodEntries,
            TotalSongs = totalSongs,
            TotalGoals = totalGoals,
            CompletedGoals = completedGoals,
            ActiveStreak = streak,
            TotalPoints = totalPoints,
            CurrentRank = currentRank,
            MostUsedFeature = mostUsedFeature,
            LastActivityAt = lastActivityAt,
            ActivityByFeature = features,
            ActivityByDay = activityByDay,
            Limitations = limitations
        };

        return ContentServiceResult<AdminEngagementOverviewDto>.Success(result);
    }

    private async Task<AdminCheckResult> CheckAdminAccessAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return AdminCheckResult.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user is null || !user.IsSystemAdmin)
        {
            return AdminCheckResult.Failure(ContentServiceStatus.Forbidden, "Admin access is required.");
        }

        return AdminCheckResult.Success();
    }

    private static AdminFeedbackResponse MapFeedback(FeedbackEntry entry)
    {
        return new AdminFeedbackResponse
        {
            Id = entry.Id,
            UserId = entry.UserId,
            Rating = entry.Rating,
            Message = entry.Message,
            Email = entry.Email,
            Context = entry.Context,
            CreatedAt = entry.CreatedAt
        };
    }

    private sealed class AdminCheckResult
    {
        public bool Succeeded { get; }
        public ContentServiceStatus Status { get; }
        public string ErrorMessage { get; }

        private AdminCheckResult(bool succeeded, ContentServiceStatus status, string errorMessage)
        {
            Succeeded = succeeded;
            Status = status;
            ErrorMessage = errorMessage;
        }

        public static AdminCheckResult Success() => new(true, ContentServiceStatus.Success, string.Empty);
        public static AdminCheckResult Failure(ContentServiceStatus status, string errorMessage) => new(false, status, errorMessage);
    }
}
