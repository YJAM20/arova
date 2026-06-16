using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Feedback;

public sealed class FeedbackRequest
{
    [Range(1, 5)]
    public int? Rating { get; set; }

    [Required]
    [StringLength(2000, MinimumLength = 1)]
    public string Message { get; set; } = string.Empty;

    [EmailAddress]
    [StringLength(256)]
    public string? Email { get; set; }

    [StringLength(200)]
    public string? Context { get; set; }
}
