using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Settings;

public sealed class CoupleSettingsUpdateRequest
{
    [Required]
    [StringLength(120, MinimumLength = 1)]
    public string TimeZone { get; set; } = "UTC";

    public bool DailyReasonsEnabled { get; set; } = true;

    public bool MoodTrackingEnabled { get; set; } = true;

    public bool PrivateByDefault { get; set; }

    [Required]
    [StringLength(80, MinimumLength = 1)]
    public string ActiveTheme { get; set; } = "default";

    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string LanguageMode { get; set; } = "en";

    public bool AnimationsEnabled { get; set; } = true;

    public bool MusicEnabled { get; set; } = true;

    public bool EmailNotificationsEnabled { get; set; } = true;

    public bool DailyDigestEnabled { get; set; } = true;

    public bool PartnerActivityEmailsEnabled { get; set; } = true;
}
