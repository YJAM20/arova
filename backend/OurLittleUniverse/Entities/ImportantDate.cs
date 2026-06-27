namespace LoveUniverse.Api.Entities;

public sealed class ImportantDate
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime Date { get; set; }

    public string Type { get; set; } = "custom"; // anniversary, birthday, first-moment, future-plan, letter-unlock, custom

    public string Recurrence { get; set; } = "none"; // none, yearly, monthly

    public bool ReminderEnabled { get; set; } = true;

    public int ReminderDaysBefore { get; set; } = 3;

    public bool IsPrivate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public AppUser CreatedByUser { get; set; } = null!;
}
