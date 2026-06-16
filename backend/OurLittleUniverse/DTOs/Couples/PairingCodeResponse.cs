namespace LoveUniverse.Api.DTOs.Couples;

public sealed class PairingCodeResponse
{
    public string Code { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }
}
