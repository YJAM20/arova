namespace LoveUniverse.Api.Entities;

public sealed class CheckIn
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public int Mood { get; set; }

    public int Energy { get; set; }

    public int Need { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
