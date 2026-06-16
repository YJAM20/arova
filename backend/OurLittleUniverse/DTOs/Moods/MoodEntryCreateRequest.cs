using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Moods;

public sealed class MoodEntryCreateRequest
{
    public DateOnly? EntryDate { get; set; }

    [Range(1, 10)]
    public int MoodValue { get; set; }

    [StringLength(1000)]
    public string? Note { get; set; }
}
