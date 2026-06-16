using LoveUniverse.Api.DTOs.Challenges;
using LoveUniverse.Api.DTOs.Chat;
using LoveUniverse.Api.DTOs.FuturePlans;
using LoveUniverse.Api.DTOs.Letters;
using LoveUniverse.Api.DTOs.Memories;
using LoveUniverse.Api.DTOs.Moods;
using LoveUniverse.Api.DTOs.Reasons;
using LoveUniverse.Api.DTOs.Settings;
using LoveUniverse.Api.DTOs.Songs;

namespace LoveUniverse.Api.DTOs.Backup;

public sealed class BackupExportResponse
{
    public string BackupVersion { get; set; } = "1.0";

    public DateTime ExportedAtUtc { get; set; }

    public Guid CoupleId { get; set; }

    public IReadOnlyList<MemoryResponse> Memories { get; set; } = [];

    public IReadOnlyList<ReasonResponse> Reasons { get; set; } = [];

    public IReadOnlyList<LetterResponse> Letters { get; set; } = [];

    public IReadOnlyList<MoodEntryResponse> MoodEntries { get; set; } = [];

    public IReadOnlyList<SongResponse> Songs { get; set; } = [];

    public IReadOnlyList<ChallengeResponse> Challenges { get; set; } = [];

    public IReadOnlyList<FuturePlanResponse> FuturePlans { get; set; } = [];

    public IReadOnlyList<ChatMessageResponse> ChatMessages { get; set; } = [];

    public CoupleSettingsResponse? Settings { get; set; }
}
