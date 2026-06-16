using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Profile;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class SetupStatusService : ISetupStatusService
{
    private readonly AppDbContext _dbContext;

    public SetupStatusService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SetupStatusResponse> GetSetupStatusAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .FirstAsync(candidate => candidate.Id == userId, cancellationToken);

        var profile = await _dbContext.UserProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

        var quickRequiredKeys = await _dbContext.OnboardingQuestions
            .AsNoTracking()
            .Where(question => question.IsActive && question.IsQuickStart && question.IsRequired)
            .Select(question => question.Key)
            .ToListAsync(cancellationToken);

        var answeredQuickKeys = await _dbContext.UserOnboardingAnswers
            .AsNoTracking()
            .Where(answer => answer.UserId == userId && quickRequiredKeys.Contains(answer.QuestionKey) && answer.AnswerValue != string.Empty)
            .Select(answer => answer.QuestionKey)
            .Distinct()
            .ToListAsync(cancellationToken);

        var coupleId = await _dbContext.CoupleMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId && member.IsActive && member.Couple.IsActive)
            .Select(member => (Guid?)member.CoupleId)
            .FirstOrDefaultAsync(cancellationToken);

        var hasSubscription = coupleId.HasValue
            && await EnsureDefaultSubscriptionAsync(coupleId.Value, cancellationToken);

        var preferredLanguage = NormalizeLanguage(profile?.PreferredLanguage);
        var safety = await ContentSafetyCalculator.GetContentSafetyAsync(_dbContext, userId, cancellationToken);

        return new SetupStatusResponse
        {
            IsVerified = user.IsVerified,
            HasCompletedQuickOnboarding = quickRequiredKeys.Count > 0 && answeredQuickKeys.Count == quickRequiredKeys.Count,
            HasCompletedProfile = profile is not null
                && !string.IsNullOrWhiteSpace(profile.DisplayName)
                && !string.IsNullOrWhiteSpace(profile.PreferredLanguage),
            HasCouple = coupleId.HasValue,
            HasSubscription = hasSubscription,
            PreferredLanguage = preferredLanguage,
            CanEnableMatureMode = safety.CanEnableMatureMode,
            MatureContentEnabled = safety.MatureContentEnabled
        };
    }

    private static string NormalizeLanguage(string? value)
    {
        var normalized = string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
        return normalized is "en" or "ar" or "es" ? normalized : "en";
    }

    private async Task<bool> EnsureDefaultSubscriptionAsync(Guid coupleId, CancellationToken cancellationToken)
    {
        var exists = await _dbContext.CoupleSubscriptions
            .AsNoTracking()
            .AnyAsync(subscription => subscription.CoupleId == coupleId, cancellationToken);

        if (exists)
        {
            return true;
        }

        var now = DateTime.UtcNow;
        _dbContext.CoupleSubscriptions.Add(new CoupleSubscription
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            PlanType = SubscriptionPlanType.Free,
            Status = "Active",
            StartedAt = now,
            CreatedAt = now
        });

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
