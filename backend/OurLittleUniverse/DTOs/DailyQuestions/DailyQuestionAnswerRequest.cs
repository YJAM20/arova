using System.ComponentModel.DataAnnotations;

namespace LoveUniverse.Api.DTOs.DailyQuestions;

public sealed class DailyQuestionAnswerRequest
{
    [Required]
    [MaxLength(4000)]
    public string Answer { get; set; } = string.Empty;
}
