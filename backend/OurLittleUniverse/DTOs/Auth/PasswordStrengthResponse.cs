namespace LoveUniverse.Api.DTOs.Auth;

public sealed class PasswordStrengthResponse
{
    public int Score { get; set; }

    public string Label { get; set; } = "Weak";

    public IReadOnlyList<string> Feedback { get; set; } = [];
}
