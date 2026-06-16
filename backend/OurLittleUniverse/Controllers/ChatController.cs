using LoveUniverse.Api.DTOs.Chat;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/chat")]
public sealed class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet("messages")]
    [ProducesResponseType(typeof(IReadOnlyList<ChatMessageResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ChatMessageResponse>>> GetMessages(CancellationToken cancellationToken)
    {
        var result = await _chatService.GetMessagesAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("messages")]
    [ProducesResponseType(typeof(ChatMessageResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ChatMessageResponse>> CreateMessage(
        ChatMessageCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _chatService.CreateMessageAsync(request, cancellationToken);
        return ToActionResult(result, success => CreatedAtAction(nameof(GetMessages), new { id = success.Id }, success));
    }

    private ActionResult ToActionResult<T>(
        ContentServiceResult<T> result,
        Func<T, ActionResult> onSuccess)
    {
        if (result.Status == ContentServiceStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        var error = new { message = result.ErrorMessage ?? "The request could not be completed." };
        return result.Status switch
        {
            ContentServiceStatus.BadRequest => BadRequest(error),
            ContentServiceStatus.Unauthorized => Unauthorized(error),
            ContentServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, error),
            ContentServiceStatus.NotFound => NotFound(error),
            _ => BadRequest(error)
        };
    }
}
