namespace LoveUniverse.Api.DTOs.Auth;

public sealed class VerificationResponse
{
    public bool Succeeded { get; set; }

    public string Message { get; set; } = string.Empty;
}
