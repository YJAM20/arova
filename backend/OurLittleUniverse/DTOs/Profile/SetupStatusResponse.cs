namespace LoveUniverse.Api.DTOs.Profile;

public sealed class SetupStatusResponse
{
    public bool IsVerified { get; set; }

    public bool HasCompletedQuickOnboarding { get; set; }

    public bool HasCompletedProfile { get; set; }

    public bool HasCouple { get; set; }

    public bool HasSubscription { get; set; }

    public string PreferredLanguage { get; set; } = "en";

    public bool CanEnableMatureMode { get; set; }

    public bool MatureContentEnabled { get; set; }
}
