namespace LoveUniverse.Api.DTOs.Couples;

public sealed class CoupleResponse
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public Guid CreatedByUserId { get; set; }

    public string CurrentUserRole { get; set; } = string.Empty;

    public int MemberCount { get; set; }

    public DateTime CreatedAt { get; set; }
}
