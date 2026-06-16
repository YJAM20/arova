namespace LoveUniverse.Api.DTOs.Feedback;

public sealed class FeedbackResponse
{
    public Guid Id { get; set; }

    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
