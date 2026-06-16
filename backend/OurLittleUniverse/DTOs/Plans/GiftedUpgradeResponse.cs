namespace LoveUniverse.Api.DTOs.Plans;

public sealed class GiftedUpgradeResponse
{
    public string Message { get; set; } = string.Empty;

    public SubscriptionResponse Subscription { get; set; } = new();
}
