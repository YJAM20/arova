namespace LoveUniverse.Api.Entities;

public sealed class OnboardingQuestion
{
    public Guid Id { get; set; }

    public string Key { get; set; } = string.Empty;

    public string TextEn { get; set; } = string.Empty;

    public string TextAr { get; set; } = string.Empty;

    public string TextEs { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public bool IsRequired { get; set; }

    public bool IsQuickStart { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
