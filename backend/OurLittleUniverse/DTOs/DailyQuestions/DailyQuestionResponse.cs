namespace LoveUniverse.Api.DTOs.DailyQuestions;

public sealed class DailyQuestionResponse
{
    public Guid Id { get; set; }
    public string Prompt { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
