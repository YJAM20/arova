namespace LoveUniverse.Api.Entities;

public sealed class DailyQuestionAnswer
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public Guid QuestionId { get; set; }

    public Guid UserId { get; set; }

    public string Answer { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public DailyQuestion Question { get; set; } = null!;

    public AppUser User { get; set; } = null!;
}
