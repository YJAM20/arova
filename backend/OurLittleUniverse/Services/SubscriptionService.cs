using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Plans;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class SubscriptionService : ISubscriptionService
{
    private const string GiftedMessage = "This one is on us. Try Arova for free while it grows. If it helps, leave us feedback.";

    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public SubscriptionService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public IReadOnlyList<PlanResponse> GetPlans()
    {
        return
        [
            new PlanResponse
            {
                PlanType = SubscriptionPlanType.Free,
                Name = "Free",
                Description = "A private shared space for two.",
                Features =
                [
                    "One shared space for two",
                    "Memories",
                    "Reasons",
                    "Letters",
                    "Mood check-ins",
                    "Daily questions basics",
                    "Basic future board",
                    "Basic secure couple chat",
                    "Basic themes",
                    "Local/API basics"
                ]
            },
            new PlanResponse
            {
                PlanType = SubscriptionPlanType.Pro,
                Name = "Pro",
                Description = "More personalization for a deeper shared space.",
                Features =
                [
                    "Everything in Free",
                    "More themes",
                    "Deeper onboarding personalization",
                    "More daily questions",
                    "Deeper check-ins",
                    "Private letters",
                    "Custom categories",
                    "More memory filters",
                    "Relationship rituals",
                    "More profile customization"
                ]
            },
            new PlanResponse
            {
                PlanType = SubscriptionPlanType.Platinum,
                Name = "Platinum",
                Description = "Premium placeholders for future product growth.",
                Features =
                [
                    "Everything in Pro",
                    "Advanced privacy controls",
                    "Premium themes",
                    "Extended relationship timeline",
                    "Advanced future planning",
                    "Smart personalization placeholders",
                    "Premium couple insights placeholders",
                    "Advanced chat media placeholders",
                    "Priority experimental features"
                ]
            }
        ];
    }

    public async Task<ContentServiceResult<SubscriptionResponse>> GetCurrentCoupleSubscriptionAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<SubscriptionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var subscription = await GetOrCreateSubscriptionAsync(context.CoupleId!.Value, cancellationToken);
        return ContentServiceResult<SubscriptionResponse>.Success(MapSubscription(subscription));
    }

    public async Task<ContentServiceResult<SubscriptionResponse>> UpdateCurrentCoupleSubscriptionAsync(
        SubscriptionUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<SubscriptionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (context.Role != CoupleRole.Owner)
        {
            return ContentServiceResult<SubscriptionResponse>.Failure(ContentServiceStatus.Forbidden, "Only the owner can update the couple subscription.");
        }

        if (!Enum.IsDefined(request.PlanType))
        {
            return ContentServiceResult<SubscriptionResponse>.Failure(ContentServiceStatus.BadRequest, "Subscription plan is invalid.");
        }

        var subscription = await GetOrCreateSubscriptionAsync(context.CoupleId!.Value, cancellationToken);
        subscription.PlanType = request.PlanType;
        subscription.Status = request.PlanType == SubscriptionPlanType.Free ? "Active" : "PendingPaymentPlaceholder";
        subscription.IsGifted = false;
        subscription.ExpiresAt = null;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<SubscriptionResponse>.Success(MapSubscription(subscription));
    }

    public async Task<ContentServiceResult<GiftedUpgradeResponse>> GiftedUpgradeAsync(
        GiftedUpgradeRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<GiftedUpgradeResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (request.PlanType is not (SubscriptionPlanType.Pro or SubscriptionPlanType.Platinum))
        {
            return ContentServiceResult<GiftedUpgradeResponse>.Failure(ContentServiceStatus.BadRequest, "Gifted upgrade must be Pro or Platinum.");
        }

        var subscription = await GetOrCreateSubscriptionAsync(context.CoupleId!.Value, cancellationToken);
        subscription.PlanType = request.PlanType;
        subscription.Status = "GiftedAccess";
        subscription.IsGifted = true;
        subscription.ExpiresAt = null;
        subscription.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<GiftedUpgradeResponse>.Success(new GiftedUpgradeResponse
        {
            Message = GiftedMessage,
            Subscription = MapSubscription(subscription)
        });
    }

    private async Task<CoupleSubscription> GetOrCreateSubscriptionAsync(Guid coupleId, CancellationToken cancellationToken)
    {
        var subscription = await _dbContext.CoupleSubscriptions
            .FirstOrDefaultAsync(candidate => candidate.CoupleId == coupleId, cancellationToken);

        if (subscription is not null)
        {
            return subscription;
        }

        var now = DateTime.UtcNow;
        subscription = new CoupleSubscription
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            PlanType = SubscriptionPlanType.Free,
            Status = "Active",
            StartedAt = now,
            CreatedAt = now
        };

        _dbContext.CoupleSubscriptions.Add(subscription);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return subscription;
    }

    private async Task<AccessContext> GetContextAsync(CancellationToken cancellationToken)
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

    private static SubscriptionResponse MapSubscription(CoupleSubscription subscription)
    {
        return new SubscriptionResponse
        {
            Id = subscription.Id,
            CoupleId = subscription.CoupleId,
            PlanType = subscription.PlanType,
            Status = subscription.Status,
            IsGifted = subscription.IsGifted,
            StartedAt = subscription.StartedAt,
            ExpiresAt = subscription.ExpiresAt,
            CreatedAt = subscription.CreatedAt,
            UpdatedAt = subscription.UpdatedAt
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
