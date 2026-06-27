namespace LoveUniverse.Api.Entities;

public sealed class DailyQuestion
{
    public Guid Id { get; set; }

    public Guid CoupleId { get; set; }

    public string Prompt { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public Couple Couple { get; set; } = null!;

    public ICollection<DailyQuestionAnswer> Answers { get; set; } = new List<DailyQuestionAnswer>();
}
