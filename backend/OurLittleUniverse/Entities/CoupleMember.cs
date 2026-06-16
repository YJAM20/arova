using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Entities;

public sealed class CoupleMember
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public CoupleRole Role { get; set; } = CoupleRole.Partner;

    public bool IsActive { get; set; } = true;

    public DateTime JoinedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
