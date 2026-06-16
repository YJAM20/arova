using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Challenges;

public sealed class ChallengeUpdateRequest
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [StringLength(4000)]
    public string? Description { get; set; }

    public DateTime? StartsAt { get; set; }

    public DateTime? EndsAt { get; set; }
}
