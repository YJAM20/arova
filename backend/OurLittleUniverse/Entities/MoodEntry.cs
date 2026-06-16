namespace LoveUniverse.Api.Entities;

public sealed class MoodEntry
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid UserId { get; set; }

    public DateOnly EntryDate { get; set; }

    public int MoodValue { get; set; }

    public string? Note { get; set; }

    public string? Response { get; set; }

    public Guid? RespondedByUserId { get; set; }

    public DateTime? RespondedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser User { get; set; } = null!;

    public AppUser? RespondedByUser { get; set; }
}
