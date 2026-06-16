namespace LoveUniverse.Api.DTOs.Settings;

public sealed class CoupleSettingsResponse
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public string TimeZone { get; set; } = "UTC";

    public bool DailyReasonsEnabled { get; set; }

    public bool MoodTrackingEnabled { get; set; }

    public bool PrivateByDefault { get; set; }

    public string ActiveTheme { get; set; } = "default";

    public string LanguageMode { get; set; } = "en";

    public bool AnimationsEnabled { get; set; }

    public bool MusicEnabled { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
