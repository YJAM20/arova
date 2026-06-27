using LoveUniverse.Api.DTOs.DailyQuestions;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/daily-questions")]
public sealed class DailyQuestionsController : ControllerBase
{
    private readonly IDailyQuestionService _dailyQuestionService;

    public DailyQuestionsController(IDailyQuestionService dailyQuestionService)
    {
        _dailyQuestionService = dailyQuestionService;
    }

    [HttpGet("today")]
    [ProducesResponseType(typeof(DailyQuestionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyQuestionResponse>> GetTodayQuestion(CancellationToken cancellationToken)
    {
        var result = await _dailyQuestionService.GetTodayQuestionAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("history")]
    [ProducesResponseType(typeof(IReadOnlyList<DailyQuestionAnswerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DailyQuestionAnswerResponse>>> GetHistory(CancellationToken cancellationToken)
    {
        var result = await _dailyQuestionService.GetHistoryAnswersAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("today/answers")]
    [ProducesResponseType(typeof(IReadOnlyList<DailyQuestionAnswerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<DailyQuestionAnswerResponse>>> GetTodayAnswers(CancellationToken cancellationToken)
    {
        var result = await _dailyQuestionService.GetTodayAnswersAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("answer")]
    [ProducesResponseType(typeof(DailyQuestionAnswerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<DailyQuestionAnswerResponse>> AnswerTodayQuestion(
        [FromBody] DailyQuestionAnswerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _dailyQuestionService.AnswerTodayQuestionAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPut("answers/{id:guid}")]
    [ProducesResponseType(typeof(DailyQuestionAnswerResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DailyQuestionAnswerResponse>> UpdateAnswer(
        Guid id,
        [FromBody] DailyQuestionAnswerRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _dailyQuestionService.UpdateAnswerAsync(id, request, cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpDelete("answers/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> DeleteAnswer(Guid id, CancellationToken cancellationToken)
    {
        var result = await _dailyQuestionService.DeleteAnswerAsync(id, cancellationToken);
        return ToActionResult(result, _ => NoContent());
    }

    private ActionResult ToActionResult<T>(
        ContentServiceResult<T> result,
        Func<T, ActionResult> onSuccess)
    {
        if (result.Status == ContentServiceStatus.Success && result.Value is not null)
        {
            return onSuccess(result.Value);
        }

        var error = new { message = result.ErrorMessage ?? "The request could not be completed." };
        return result.Status switch
        {
            ContentServiceStatus.BadRequest => BadRequest(error),
            ContentServiceStatus.Unauthorized => Unauthorized(error),
            ContentServiceStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, error),
            ContentServiceStatus.NotFound => NotFound(error),
            _ => BadRequest(error)
        };
    }
}
