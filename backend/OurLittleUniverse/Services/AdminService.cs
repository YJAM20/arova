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

    public AdminService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
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
