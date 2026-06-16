namespace LoveUniverse.Api.Entities;

public sealed class CustomSectionItem
{
    public Guid Id { get; set; }

    public Guid CustomSectionId { get; set; }

    public string Text { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public CustomSection CustomSection { get; set; } = null!;
}
