using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Chat;

public sealed class ChatMessageCreateRequest
{
    public ChatMessageType MessageType { get; set; } = ChatMessageType.Text;

    [StringLength(4000)]
    public string Message { get; set; } = string.Empty;

    [StringLength(2048)]
    public string? AttachmentUrl { get; set; }

    [StringLength(120)]
    public string? AttachmentMimeType { get; set; }

    public long? AttachmentSizeBytes { get; set; }

    [StringLength(40)]
    public string? EncryptionMode { get; set; }

    public string? EncryptedPayload { get; set; }

    [StringLength(256)]
    public string? Nonce { get; set; }

    [StringLength(256)]
    public string? KeyId { get; set; }
}
