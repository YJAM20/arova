using LoveUniverse.Api.DTOs.Onboarding;
using LoveUniverse.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoveUniverse.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/onboarding")]
public sealed class OnboardingController : ControllerBase
{
    private readonly IOnboardingService _onboardingService;

    public OnboardingController(IOnboardingService onboardingService)
    {
        _onboardingService = onboardingService;
    }

    [HttpGet("questions")]
    [ProducesResponseType(typeof(IReadOnlyList<OnboardingQuestionResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<OnboardingQuestionResponse>>> GetQuestions(CancellationToken cancellationToken)
    {
        var result = await _onboardingService.GetQuestionsAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpGet("my-answers")]
    [ProducesResponseType(typeof(IReadOnlyList<OnboardingAnswerResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<OnboardingAnswerResponse>>> GetMyAnswers(CancellationToken cancellationToken)
    {
        var result = await _onboardingService.GetMyAnswersAsync(cancellationToken);
        return ToActionResult(result, Ok);
    }

    [HttpPost("answers")]
    [ProducesResponseType(typeof(IReadOnlyList<OnboardingAnswerResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyList<OnboardingAnswerResponse>>> UpsertAnswers(
        OnboardingAnswersRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _onboardingService.UpsertAnswersAsync(request, cancellationToken);
        return ToActionResult(result, Ok);
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
