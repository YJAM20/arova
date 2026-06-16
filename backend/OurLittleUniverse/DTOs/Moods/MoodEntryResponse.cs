namespace LoveUniverse.Api.DTOs.Moods;

public sealed class MoodEntryResponse
{
    public Guid Id { get; set; }

    public DateOnly EntryDate { get; set; }

    public int MoodValue { get; set; }

    public string? Note { get; set; }

    public Guid UserId { get; set; }

    public string UserDisplayName { get; set; } = string.Empty;

    public string? Response { get; set; }

    public Guid? RespondedByUserId { get; set; }

    public string? RespondedByDisplayName { get; set; }

    public DateTime? RespondedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
