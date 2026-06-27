namespace LoveUniverse.Api.DTOs.DailyQuestions;

public sealed class DailyQuestionAnswerResponse
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public string DateKey { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserDisplayName { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
