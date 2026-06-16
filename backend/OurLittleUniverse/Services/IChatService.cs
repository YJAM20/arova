using LoveUniverse.Api.DTOs.Chat;

namespace LoveUniverse.Api.Services;

public interface IChatService
{
    Task<ContentServiceResult<IReadOnlyList<ChatMessageResponse>>> GetMessagesAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ChatMessageResponse>> CreateMessageAsync(ChatMessageCreateRequest request, CancellationToken cancellationToken = default);
}
