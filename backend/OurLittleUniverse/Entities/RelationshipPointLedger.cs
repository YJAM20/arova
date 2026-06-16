namespace LoveUniverse.Api.Entities;

public sealed class RelationshipPointLedger
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public string ActionType { get; set; } = string.Empty;

    public int Points { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string? SourceType { get; set; }

    public Guid? SourceId { get; set; }

    public DateTime CreatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
