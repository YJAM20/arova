using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Chat;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class ChatService : IChatService
{
    private const int MaxMessagesToReturn = 100;

    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IHubContext<CoupleHub> _hubContext;

    public ChatService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IHubContext<CoupleHub> hubContext)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _hubContext = hubContext;
    }

    public async Task<ContentServiceResult<IReadOnlyList<ChatMessageResponse>>> GetMessagesAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<ChatMessageResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var messages = await _dbContext.ChatMessages
            .AsNoTracking()
            .Include(message => message.User)
            .Where(message => message.CoupleId == context.CoupleId)
            .OrderByDescending(message => message.SentAt)
            .Take(MaxMessagesToReturn)
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<ChatMessageResponse>>.Success(
            messages.OrderBy(message => message.SentAt).Select(MapMessage).ToList());
    }

    public async Task<ContentServiceResult<ChatMessageResponse>> CreateMessageAsync(
        ChatMessageCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<ChatMessageResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var text = request.Message?.Trim() ?? string.Empty;
        if (text.Length > 4000)
        {
            return ContentServiceResult<ChatMessageResponse>.Failure(ContentServiceStatus.BadRequest, "Message is too long. Maximum 4000 characters.");
        }

        var attachmentUrl = CleanOptional(request.AttachmentUrl);
        if (request.MessageType is ChatMessageType.Text or ChatMessageType.Emoji or ChatMessageType.System
            && string.IsNullOrWhiteSpace(text))
        {
            return ContentServiceResult<ChatMessageResponse>.Failure(ContentServiceStatus.BadRequest, "Message is required.");
        }

        if (request.MessageType == ChatMessageType.Image && string.IsNullOrWhiteSpace(attachmentUrl))
        {
            return ContentServiceResult<ChatMessageResponse>.Failure(ContentServiceStatus.BadRequest, "Image messages need an attachment URL.");
        }

        if (request.AttachmentSizeBytes is < 0)
        {
            return ContentServiceResult<ChatMessageResponse>.Failure(ContentServiceStatus.BadRequest, "Attachment size is invalid.");
        }

        var now = DateTime.UtcNow;
        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            UserId = context.UserId!.Value,
            MessageType = request.MessageType,
            Message = text,
            AttachmentUrl = attachmentUrl,
            AttachmentMimeType = CleanOptional(request.AttachmentMimeType),
            AttachmentSizeBytes = request.AttachmentSizeBytes,
            EncryptionMode = CleanOptional(request.EncryptionMode) ?? "None",
            EncryptedPayload = CleanOptional(request.EncryptedPayload),
            Nonce = CleanOptional(request.Nonce),
            KeyId = CleanOptional(request.KeyId),
            SentAt = now,
            CreatedAt = now
        };

        _dbContext.ChatMessages.Add(message);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.ChatMessages
            .AsNoTracking()
            .Include(candidate => candidate.User)
            .FirstAsync(candidate => candidate.Id == message.Id, cancellationToken);

        var response = MapMessage(created);

        await _hubContext.Clients
            .Group($"couple-{context.CoupleId}")
            .SendAsync("ReceiveMessage", response, cancellationToken);

        return ContentServiceResult<ChatMessageResponse>.Success(response);
    }

    private async Task<AccessContext> GetAccessContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return AccessContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (coupleId is null || role is null)
        {
            return AccessContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return AccessContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static ChatMessageResponse MapMessage(ChatMessage message)
    {
        return new ChatMessageResponse
        {
            Id = message.Id,
            UserId = message.UserId,
            UserDisplayName = message.User.DisplayName ?? message.User.Username,
            MessageType = message.MessageType,
            Message = message.Message,
            AttachmentUrl = message.AttachmentUrl,
            AttachmentMimeType = message.AttachmentMimeType,
            AttachmentSizeBytes = message.AttachmentSizeBytes,
            EncryptionMode = message.EncryptionMode,
            EncryptedPayload = message.EncryptedPayload,
            Nonce = message.Nonce,
            KeyId = message.KeyId,
            SentAt = message.SentAt,
            CreatedAt = message.CreatedAt
        };
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private sealed record AccessContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static AccessContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new AccessContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static AccessContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new AccessContext(false, null, null, null, status, errorMessage);
        }
    }
}
