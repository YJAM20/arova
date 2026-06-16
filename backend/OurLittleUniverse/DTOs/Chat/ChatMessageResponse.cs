using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Chat;

public sealed class ChatMessageResponse
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string UserDisplayName { get; set; } = string.Empty;

    public ChatMessageType MessageType { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? AttachmentUrl { get; set; }

    public string? AttachmentMimeType { get; set; }

    public long? AttachmentSizeBytes { get; set; }

    public string EncryptionMode { get; set; } = "None";

    public string? EncryptedPayload { get; set; }

    public string? Nonce { get; set; }

    public string? KeyId { get; set; }

    public DateTime SentAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
