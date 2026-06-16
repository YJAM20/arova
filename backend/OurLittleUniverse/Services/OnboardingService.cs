using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Onboarding;
using LoveUniverse.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class OnboardingService : IOnboardingService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public OnboardingService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<OnboardingQuestionResponse>>> GetQuestionsAsync(CancellationToken cancellationToken = default)
    {
        var questions = await _dbContext.OnboardingQuestions
            .AsNoTracking()
            .Where(question => question.IsActive)
            .OrderBy(question => question.SortOrder)
            .Select(question => new OnboardingQuestionResponse
            {
                Key = question.Key,
                TextEn = question.TextEn,
                TextAr = question.TextAr,
                TextEs = question.TextEs,
                Type = question.Type,
                Category = question.Category,
                IsRequired = question.IsRequired,
                IsQuickStart = question.IsQuickStart,
                SortOrder = question.SortOrder
            })
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<OnboardingQuestionResponse>>.Success(questions);
    }

    public async Task<ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>> GetMyAnswersAsync(CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var answers = await _dbContext.UserOnboardingAnswers
            .AsNoTracking()
            .Where(answer => answer.UserId == userId.Value)
            .OrderBy(answer => answer.QuestionKey)
            .Select(answer => new OnboardingAnswerResponse
            {
                QuestionKey = answer.QuestionKey,
                AnswerValue = answer.AnswerValue,
                CreatedAt = answer.CreatedAt,
                UpdatedAt = answer.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>.Success(answers);
    }

    public async Task<ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>> UpsertAnswersAsync(
        OnboardingAnswersRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var items = request.Answers ?? [];
        if (items.Count == 0)
        {
            return ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>.Failure(ContentServiceStatus.BadRequest, "At least one answer is required.");
        }

        var allowedKeys = await _dbContext.OnboardingQuestions
            .AsNoTracking()
            .Where(question => question.IsActive)
            .Select(question => question.Key)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var item in items)
        {
            if (item is null
                || string.IsNullOrWhiteSpace(item.QuestionKey)
                || string.IsNullOrWhiteSpace(item.AnswerValue))
            {
                return ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>.Failure(ContentServiceStatus.BadRequest, "Question key and answer value are required.");
            }

            var key = item.QuestionKey.Trim();
            if (!allowedKeys.Contains(key))
            {
                return ContentServiceResult<IReadOnlyList<OnboardingAnswerResponse>>.Failure(ContentServiceStatus.BadRequest, "One or more onboarding questions are invalid.");
            }

            var answer = await _dbContext.UserOnboardingAnswers
                .FirstOrDefaultAsync(candidate => candidate.UserId == userId.Value && candidate.QuestionKey == key, cancellationToken);

            if (answer is null)
            {
                _dbContext.UserOnboardingAnswers.Add(new UserOnboardingAnswer
                {
                    Id = Guid.NewGuid(),
                    UserId = userId.Value,
                    QuestionKey = key,
                    AnswerValue = item.AnswerValue.Trim(),
                    CreatedAt = now
                });
            }
            else
            {
                answer.AnswerValue = item.AnswerValue.Trim();
                answer.UpdatedAt = now;
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return await GetMyAnswersAsync(cancellationToken);
    }
}
