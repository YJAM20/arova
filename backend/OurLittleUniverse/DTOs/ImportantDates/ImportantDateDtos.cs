using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.ImportantDates;

public sealed class ImportantDateCreateRequest
{
    [Required]
    [StringLength(160, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = "custom"; // anniversary, birthday, first-moment, future-plan, letter-unlock, custom

    [Required]
    [StringLength(50)]
    public string Recurrence { get; set; } = "none"; // none, yearly, monthly

    public bool ReminderEnabled { get; set; } = true;

    [Range(0, 30)]
    public int ReminderDaysBefore { get; set; } = 3;

    public bool IsPrivate { get; set; }
}

public sealed class ImportantDateUpdateRequest
{
    [Required]
    [StringLength(160, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = "custom";

    [Required]
    [StringLength(50)]
    public string Recurrence { get; set; } = "none";

    public bool ReminderEnabled { get; set; } = true;

    [Range(0, 30)]
    public int ReminderDaysBefore { get; set; } = 3;

    public bool IsPrivate { get; set; }
}

public sealed class ImportantDateResponse
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime Date { get; set; }

    public string Type { get; set; } = "custom";

    public string Recurrence { get; set; } = "none";

    public bool ReminderEnabled { get; set; }

    public int ReminderDaysBefore { get; set; }

    public bool IsPrivate { get; set; }

    public int DaysRemaining { get; set; }

    public DateTime NextOccurrenceDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
