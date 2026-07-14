using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Plans;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace LoveUniverse.Api.Services;

public sealed class SubscriptionService : ISubscriptionService
{
    private const string GiftedMessage = "This one is on us. Try Arova for free while it grows. If it helps, leave us feedback.";

    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly StripeOptions _stripeOptions;
    private readonly ILogger<SubscriptionService> _logger;

    public SubscriptionService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IOptions<StripeOptions> stripeOptions,
        ILogger<SubscriptionService> logger)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _stripeOptions = stripeOptions.Value;
        _logger = logger;
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

    public async Task<ContentServiceResult<string>> CreateCheckoutSessionAsync(
        SubscriptionPlanType planType,
        string successUrl,
        string cancelUrl,
        CancellationToken cancellationToken = default)
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        if (coupleId is null)
        {
            return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "You must belong to a couple to upgrade subscriptions.");
        }

        var priceId = planType switch
        {
            SubscriptionPlanType.Pro => _stripeOptions.ProPriceId,
            SubscriptionPlanType.Platinum => _stripeOptions.PlatinumPriceId,
            _ => null
        };

        if (!StripeOptions.IsPriceConfigured(priceId))
        {
            _logger.LogWarning("Attempted checkout for {PlanType} but Stripe price ID configuration is placeholder.", planType);
            return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "Stripe price identifiers are not configured on the server.");
        }

        try
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new()
                    {
                        Price = priceId,
                        Quantity = 1
                    }
                },
                Mode = "subscription",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl,
                Metadata = new Dictionary<string, string>
                {
                    { "coupleId", coupleId.Value.ToString() },
                    { "planType", planType.ToString() }
                }
            };

            var requestOptions = new RequestOptions
            {
                IdempotencyKey = $"checkout-{coupleId.Value}-{planType}"
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options, requestOptions, cancellationToken: cancellationToken);
            return ContentServiceResult<string>.Success(session.Url);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe exception occurred while creating checkout session.");
            return ContentServiceResult<string>.Failure(ContentServiceStatus.BadRequest, "An error occurred while creating the checkout session. Please try again.");
        }
    }

    public async Task<ContentServiceResult<bool>> ProcessWebhookAsync(
        string json,
        string stripeSignature,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_stripeOptions.WebhookSecret))
        {
            _logger.LogError("Stripe WebhookSecret is missing. Cannot verify webhook signature.");
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.BadRequest, "Stripe Webhook Secret is not configured on the server.");
        }

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _stripeOptions.WebhookSecret);
            if (stripeEvent.Type == Events.CheckoutSessionCompleted)
            {
                var session = stripeEvent.Data.Object as Session;
                if (session?.Metadata != null &&
                    session.Metadata.TryGetValue("coupleId", out var coupleIdStr) &&
                    session.Metadata.TryGetValue("planType", out var planTypeStr) &&
                    Guid.TryParse(coupleIdStr, out var coupleId) &&
                    Enum.TryParse<SubscriptionPlanType>(planTypeStr, out var planType))
                {
                    var subscription = await GetOrCreateSubscriptionAsync(coupleId, cancellationToken);
                    subscription.PlanType = planType;
                    subscription.Status = "Active";
                    subscription.IsGifted = false;
                    subscription.ExpiresAt = null;
                    subscription.UpdatedAt = DateTime.UtcNow;

                    await _dbContext.SaveChangesAsync(cancellationToken);
                    _logger.LogInformation("Successfully upgraded subscription for couple {CoupleId} to {PlanType} via Stripe webhook.", coupleId, planType);
                    return ContentServiceResult<bool>.Success(true);
                }
                
                _logger.LogWarning("Stripe checkout completed webhook received but session metadata is incomplete.");
                return ContentServiceResult<bool>.Failure(ContentServiceStatus.BadRequest, "Stripe checkout session metadata was incomplete.");
            }

            return ContentServiceResult<bool>.Success(false);
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Stripe exception occurred while verifying webhook event signature.");
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.BadRequest, $"Signature verification failed: {ex.Message}");
        }
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
