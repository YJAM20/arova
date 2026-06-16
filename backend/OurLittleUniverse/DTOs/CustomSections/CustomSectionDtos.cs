using System.ComponentModel.DataAnnotations;
using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.CustomSections;

public sealed class CustomSectionResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Icon { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; }

    public Guid CreatedByUserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public IReadOnlyList<CustomSectionItemResponse> Items { get; set; } = [];
}

public sealed class CustomSectionItemResponse
{
    public Guid Id { get; set; }

    public string Text { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public int SortOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}

public sealed class CreateCustomSectionRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(80)]
    public string? Icon { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;
}

public sealed class UpdateCustomSectionRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(80)]
    public string? Icon { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; } = VisibilityLevel.Shared;
}

public sealed class CreateCustomSectionItemRequest
{
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string Text { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public sealed class UpdateCustomSectionItemRequest
{
    [Required]
    [StringLength(500, MinimumLength = 1)]
    public string Text { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }

    public int SortOrder { get; set; }
}
