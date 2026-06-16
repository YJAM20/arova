using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class ChatMessage
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public ChatMessageType MessageType { get; set; } = ChatMessageType.Text;

    public string Message { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }

    public string? AttachmentMimeType { get; set; }

    public long? AttachmentSizeBytes { get; set; }

    public string EncryptionMode { get; set; } = "None";

    public string? EncryptedPayload { get; set; }

    public string? Nonce { get; set; }

    public string? KeyId { get; set; }

    public DateTime SentAt { get; set; }

    public DateTime? EditedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
