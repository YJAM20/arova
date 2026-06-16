using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.Challenges;

public sealed class ChallengeCompleteRequest
{
    [StringLength(1000)]
    public string? Note { get; set; }
}
