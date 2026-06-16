namespace LoveUniverse.Api.Entities;

public sealed class FeedbackEntry
{
    public Guid Id { get; set; }

    public Guid? UserId { get; set; }

    public int? Rating { get; set; }

    public string Message { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? Context { get; set; }

    public DateTime CreatedAt { get; set; }

    public AppUser? User { get; set; }
}
