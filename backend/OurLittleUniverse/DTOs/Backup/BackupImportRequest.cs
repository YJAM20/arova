using LoveUniverse.Api.DTOs.Challenges;
using LoveUniverse.Api.DTOs.FuturePlans;
using LoveUniverse.Api.DTOs.Settings;
using LoveUniverse.Api.DTOs.Songs;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Backup;

public sealed class BackupImportRequest
{
    public IReadOnlyList<BackupMemoryItem> Memories { get; set; } = [];

    public IReadOnlyList<BackupReasonItem> Reasons { get; set; } = [];

    public IReadOnlyList<BackupLetterItem> Letters { get; set; } = [];

    public IReadOnlyList<BackupMoodItem> MoodEntries { get; set; } = [];

    public IReadOnlyList<SongCreateRequest> Songs { get; set; } = [];

    public IReadOnlyList<ChallengeCreateRequest> Challenges { get; set; } = [];

    public IReadOnlyList<FuturePlanCreateRequest> FuturePlans { get; set; } = [];

    public IReadOnlyList<BackupChatMessageItem> ChatMessages { get; set; } = [];

    public CoupleSettingsUpdateRequest? Settings { get; set; }
}

public sealed class BackupMemoryItem
{
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? PrivateNote { get; set; }

    public DateTime? MemoryDate { get; set; }

    public string? Location { get; set; }

    public string? MediaUrl { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;
}

public sealed class BackupReasonItem
{
    public string Text { get; set; } = string.Empty;

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;

    public DateTime? UnlockDate { get; set; }
}

public sealed class BackupLetterItem
{
    public string Title { get; set; } = string.Empty;

    public string Body { get; set; } = string.Empty;

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;

    public DateTime? OpenOnUtc { get; set; }

    public bool IsLocked { get; set; }
}

public sealed class BackupMoodItem
{
    public DateOnly? EntryDate { get; set; }

    public int MoodValue { get; set; }

    public string? Note { get; set; }
}

public sealed class BackupChatMessageItem
{
    public ChatMessageType MessageType { get; set; } = ChatMessageType.Text;

    public string Message { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }

    public string? AttachmentMimeType { get; set; }

    public long? AttachmentSizeBytes { get; set; }

    public string? EncryptionMode { get; set; }

    public string? EncryptedPayload { get; set; }

    public string? Nonce { get; set; }

    public string? KeyId { get; set; }

    public DateTime? SentAt { get; set; }
}
