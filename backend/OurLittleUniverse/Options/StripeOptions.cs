namespace LoveUniverse.Api.Options;

public sealed class StripeOptions
{
    public const string ProPricePlaceholder = "price_pro_placeholder";
    public const string PlatinumPricePlaceholder = "price_plat_placeholder";

    public string ApiKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string ProPriceId { get; set; } = string.Empty;
    public string PlatinumPriceId { get; set; } = string.Empty;

    /// <summary>
    /// Returns true when the price ID is non-empty and is not a known placeholder value.
    /// </summary>
    public static bool IsPriceConfigured(string? priceId) =>
        !string.IsNullOrWhiteSpace(priceId) &&
        !string.Equals(priceId, ProPricePlaceholder, StringComparison.Ordinal) &&
        !string.Equals(priceId, PlatinumPricePlaceholder, StringComparison.Ordinal);
}
