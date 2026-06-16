namespace LoveUniverse.Api.DTOs.Couples;

public sealed class CoupleMemberResponse
{
    public Guid UserId { get; set; }

    public string DisplayName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string? AvatarUrl { get; set; }

    public string Role { get; set; } = string.Empty;

    public DateTime JoinedAt { get; set; }
}
