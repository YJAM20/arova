using LoveUniverse.Api.DTOs.Chat;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LoveUniverse.Api.Hubs;

[Authorize]
public sealed class CoupleHub : Hub
{
    private readonly IPermissionService _permissionService;
    private readonly IChatService _chatService;

    public CoupleHub(IPermissionService permissionService, IChatService chatService)
    {
        _permissionService = permissionService;
        _chatService = chatService;
    }

    public override async Task OnConnectedAsync()
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(Context.ConnectionAborted);
        if (coupleId is null)
        {
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(coupleId.Value), Context.ConnectionAborted);
        await base.OnConnectedAsync();
    }

    public async Task<ChatMessageResponse> SendMessage(string message)
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(Context.ConnectionAborted);
        if (coupleId is null)
        {
            throw new HubException("Create or join a couple space first.");
        }

        var result = await _chatService.CreateMessageAsync(
            new ChatMessageCreateRequest { Message = message },
            Context.ConnectionAborted);

        if (!result.Succeeded || result.Value is null)
        {
            throw new HubException(result.ErrorMessage ?? "Message could not be sent.");
        }

        return result.Value;
    }

    private static string GetGroupName(Guid coupleId)
    {
        return $"couple-{coupleId}";
    }
}
