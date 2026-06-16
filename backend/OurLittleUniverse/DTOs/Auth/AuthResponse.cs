namespace LoveUniverse.Api.DTOs.Auth;

public sealed class AuthResponse
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAtUtc { get; set; }

    public UserResponse User { get; set; } = new();

    public bool IsVerified { get; set; }

    public bool HasCompletedQuickOnboarding { get; set; }

    public bool HasCompletedProfile { get; set; }

    public bool HasCouple { get; set; }

    public string PreferredLanguage { get; set; } = "en";

    public bool CanEnableMatureMode { get; set; }

    public bool MatureContentEnabled { get; set; }
}
