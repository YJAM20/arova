namespace LoveUniverse.Api.Options;

public sealed class StripeOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string ProPriceId { get; set; } = string.Empty;
    public string PlatinumPriceId { get; set; } = string.Empty;
}
