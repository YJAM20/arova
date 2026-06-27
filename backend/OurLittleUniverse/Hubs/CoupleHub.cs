using System.Collections.Concurrent;
using System.Security.Claims;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Chat;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Hubs;

public sealed class UserPresenceState
{
    public string UserId { get; set; } = string.Empty;
    public string CoupleId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public bool IsOnline { get; set; }
    public string? ActiveSpace { get; set; }
    public string LastSeenAt { get; set; } = string.Empty;
}

[Authorize]
public sealed class CoupleHub : Hub
{
    private static readonly ConcurrentDictionary<Guid, UserPresenceState> Presence = new();

    private readonly IPermissionService _permissionService;
    private readonly IChatService _chatService;
    private readonly AppDbContext _dbContext;

    public CoupleHub(
        IPermissionService permissionService,
        IChatService chatService,
        AppDbContext dbContext)
    {
        _permissionService = permissionService;
        _chatService = chatService;
        _dbContext = dbContext;
    }

    public override async Task OnConnectedAsync()
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(Context.ConnectionAborted);
        var userId = GetUserId();

        if (coupleId is null || userId is null)
        {
            Context.Abort();
            return;
        }

        var groupName = GetGroupName(coupleId.Value);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName, Context.ConnectionAborted);

        // Fetch user display name
        string displayName = "Partner";
        var user = await _dbContext.AppUsers.FindAsync(new object[] { userId.Value }, Context.ConnectionAborted);
        if (user != null)
        {
            displayName = user.DisplayName ?? user.Username;
        }

        var presenceState = new UserPresenceState
        {
            UserId = userId.Value.ToString(),
            CoupleId = coupleId.Value.ToString(),
            DisplayName = displayName,
            IsOnline = true,
            ActiveSpace = null,
            LastSeenAt = DateTime.UtcNow.ToString("o")
        };

        Presence[userId.Value] = presenceState;

        // Broadcast to group (notifying partner)
        await Clients.Group(groupName).SendAsync("partnerOnline", presenceState, Context.ConnectionAborted);

        // Send partner's presence to caller if partner is already online
        var partnerPresence = Presence.Values
            .FirstOrDefault(p => p.UserId != userId.Value.ToString() && p.CoupleId == coupleId.Value.ToString() && p.IsOnline);

        if (partnerPresence != null)
        {
            await Clients.Caller.SendAsync("partnerOnline", partnerPresence, Context.ConnectionAborted);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(CancellationToken.None);
        var userId = GetUserId();

        if (coupleId is not null && userId is not null)
        {
            if (Presence.TryGetValue(userId.Value, out var presenceState))
            {
                presenceState.IsOnline = false;
                presenceState.LastSeenAt = DateTime.UtcNow.ToString("o");
                presenceState.ActiveSpace = null;

                var groupName = GetGroupName(coupleId.Value);
                await Clients.Group(groupName).SendAsync("partnerOffline", presenceState);
            }
        }

        await base.OnDisconnectedAsync(exception);
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

    public async Task SendActiveSpace(string spaceName)
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(Context.ConnectionAborted);
        var userId = GetUserId();

        if (coupleId is null || userId is null)
        {
            return;
        }

        if (Presence.TryGetValue(userId.Value, out var presenceState))
        {
            presenceState.ActiveSpace = SanitizeActiveSpace(spaceName);
            presenceState.LastSeenAt = DateTime.UtcNow.ToString("o");

            await Clients.Group(GetGroupName(coupleId.Value)).SendAsync("partnerViewingSpace", presenceState);
        }
    }

    public async Task SendTypingState(bool isTyping)
    {
        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(Context.ConnectionAborted);
        var userId = GetUserId();

        if (coupleId is null || userId is null)
        {
            return;
        }

        await Clients.Group(GetGroupName(coupleId.Value)).SendAsync("partnerTyping", userId.Value.ToString(), isTyping);
    }

    private Guid? GetUserId()
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            var idClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(idClaim, out var parsedId))
            {
                userId = parsedId;
            }
        }
        return userId;
    }

    private static string SanitizeActiveSpace(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "Unknown";
        name = name.Trim();
        if (name.Length > 50) name = name.Substring(0, 50);
        return name;
    }

    private static string GetGroupName(Guid coupleId)
    {
        return $"couple-{coupleId}";
    }
}

