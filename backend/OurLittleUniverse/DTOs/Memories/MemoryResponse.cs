using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.DTOs.Memories;

public sealed class MemoryResponse
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? PrivateNote { get; set; }

    public bool IsPrivateNoteHidden { get; set; }

    public DateTime? MemoryDate { get; set; }

    public string? Location { get; set; }

    public string? MediaUrl { get; set; }

    public VisibilityLevel VisibilityLevel { get; set; }

    public Guid CreatedByUserId { get; set; }

    public string CreatedByDisplayName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}
