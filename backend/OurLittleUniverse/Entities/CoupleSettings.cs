namespace LoveUniverse.Api.Entities;

public sealed class CoupleSettings
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public string TimeZone { get; set; } = "UTC";

    public bool DailyReasonsEnabled { get; set; } = true;

    public bool MoodTrackingEnabled { get; set; } = true;

    public bool PrivateByDefault { get; set; }

    public string ActiveTheme { get; set; } = "default";

    public string LanguageMode { get; set; } = "en";

    public bool AnimationsEnabled { get; set; } = true;

    public bool MusicEnabled { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;
}
