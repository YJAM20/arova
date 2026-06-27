using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.DailyQuestions;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class DailyQuestionService : IDailyQuestionService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    private static readonly IReadOnlyList<(string Category, string Prompt)> PresetQuestions = new List<(string, string)>
    {
        ("connection", "What helped you feel close to your partner recently?"),
        ("fun", "What small silly thing would make today lighter for both of you?"),
        ("deep", "What is one feeling you want your partner to understand better?"),
        ("appreciation", "What is one ordinary thing your partner does that you appreciate?"),
        ("future", "What is one simple future moment you would like to share?"),
        ("conflict-safe", "What helps you feel respected during a hard conversation?"),
        ("connection", "What is one way you can make distance feel smaller this week?"),
        ("fun", "What would be your ideal low-effort date at home?"),
        ("deep", "What is something you are learning about yourself in this relationship?"),
        ("appreciation", "What made you feel cared for recently?"),
        ("future", "What shared habit would you like to build slowly?"),
        ("conflict-safe", "What gentle reset would help after a misunderstanding?")
    };

    public DailyQuestionService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    private static string GetTodayDateKey()
    {
        return DateTime.UtcNow.ToString("yyyy-MM-dd");
    }

    private static int GetQuestionIndex(string dateKey)
    {
        var seed = dateKey.Sum(c => (int)c);
        return seed % PresetQuestions.Count;
    }

    public async Task<ContentServiceResult<DailyQuestionResponse>> GetTodayQuestionAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyQuestionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var dateKey = GetTodayDateKey();
        var index = GetQuestionIndex(dateKey);
        var preset = PresetQuestions[index];

        var question = await _dbContext.DailyQuestions
            .FirstOrDefaultAsync(q => q.CoupleId == context.CoupleId
                && q.Prompt == preset.Prompt, cancellationToken);

        if (question is null)
        {
            question = new DailyQuestion
            {
                Id = Guid.NewGuid(),
                CoupleId = context.CoupleId!.Value,
                Prompt = preset.Prompt,
                Category = preset.Category,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            _dbContext.DailyQuestions.Add(question);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return ContentServiceResult<DailyQuestionResponse>.Success(new DailyQuestionResponse
        {
            Id = question.Id,
            Prompt = question.Prompt,
            Category = question.Category
        });
    }

    public async Task<ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>> GetTodayAnswersAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var todayQuestionResult = await GetTodayQuestionAsync(cancellationToken);
        if (!todayQuestionResult.Succeeded || todayQuestionResult.Value is null)
        {
            return ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>.Failure(todayQuestionResult.Status, todayQuestionResult.ErrorMessage);
        }

        var questionId = todayQuestionResult.Value.Id;

        var answers = await _dbContext.DailyQuestionAnswers
            .Include(a => a.User)
            .Where(a => a.CoupleId == context.CoupleId && a.QuestionId == questionId)
            .ToListAsync(cancellationToken);

        var dateKey = GetTodayDateKey();
        var responses = answers.Select(a => new DailyQuestionAnswerResponse
        {
            Id = a.Id,
            QuestionId = a.QuestionId,
            DateKey = dateKey,
            UserId = a.UserId,
            UserDisplayName = a.User.DisplayName ?? a.User.Username,
            Answer = a.Answer,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        }).ToList();

        return ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>> GetHistoryAnswersAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var answers = await _dbContext.DailyQuestionAnswers
            .Include(a => a.User)
            .Where(a => a.CoupleId == context.CoupleId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = answers.Select(a => new DailyQuestionAnswerResponse
        {
            Id = a.Id,
            QuestionId = a.QuestionId,
            DateKey = a.CreatedAt.ToString("yyyy-MM-dd"),
            UserId = a.UserId,
            UserDisplayName = a.User.DisplayName ?? a.User.Username,
            Answer = a.Answer,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        }).ToList();

        return ContentServiceResult<IReadOnlyList<DailyQuestionAnswerResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<DailyQuestionAnswerResponse>> AnswerTodayQuestionAsync(
        DailyQuestionAnswerRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var trimmed = request.Answer.Trim();
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(ContentServiceStatus.BadRequest, "Answer cannot be empty.");
        }

        var todayQuestionResult = await GetTodayQuestionAsync(cancellationToken);
        if (!todayQuestionResult.Succeeded || todayQuestionResult.Value is null)
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(todayQuestionResult.Status, todayQuestionResult.ErrorMessage);
        }

        var questionId = todayQuestionResult.Value.Id;

        var existing = await _dbContext.DailyQuestionAnswers
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.CoupleId == context.CoupleId
                && a.QuestionId == questionId
                && a.UserId == context.UserId, cancellationToken);

        var now = DateTime.UtcNow;
        var dateKey = GetTodayDateKey();

        if (existing is not null)
        {
            existing.Answer = trimmed;
            existing.UpdatedAt = now;
            await _dbContext.SaveChangesAsync(cancellationToken);

            return ContentServiceResult<DailyQuestionAnswerResponse>.Success(new DailyQuestionAnswerResponse
            {
                Id = existing.Id,
                QuestionId = existing.QuestionId,
                DateKey = dateKey,
                UserId = existing.UserId,
                UserDisplayName = existing.User.DisplayName ?? existing.User.Username,
                Answer = existing.Answer,
                CreatedAt = existing.CreatedAt,
                UpdatedAt = existing.UpdatedAt
            });
        }

        var answer = new DailyQuestionAnswer
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            QuestionId = questionId,
            UserId = context.UserId!.Value,
            Answer = trimmed,
            CreatedAt = now
        };

        _dbContext.DailyQuestionAnswers.Add(answer);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var user = await _dbContext.AppUsers
            .FirstAsync(u => u.Id == context.UserId, cancellationToken);

        return ContentServiceResult<DailyQuestionAnswerResponse>.Success(new DailyQuestionAnswerResponse
        {
            Id = answer.Id,
            QuestionId = answer.QuestionId,
            DateKey = dateKey,
            UserId = answer.UserId,
            UserDisplayName = user.DisplayName ?? user.Username,
            Answer = answer.Answer,
            CreatedAt = answer.CreatedAt,
            UpdatedAt = answer.UpdatedAt
        });
    }

    public async Task<ContentServiceResult<DailyQuestionAnswerResponse>> UpdateAnswerAsync(
        Guid id,
        DailyQuestionAnswerRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var trimmed = request.Answer.Trim();
        if (string.IsNullOrWhiteSpace(trimmed))
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(ContentServiceStatus.BadRequest, "Answer cannot be empty.");
        }

        var answer = await _dbContext.DailyQuestionAnswers
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id && a.CoupleId == context.CoupleId, cancellationToken);

        if (answer is null)
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(ContentServiceStatus.NotFound, "Answer not found.");
        }

        if (answer.UserId != context.UserId)
        {
            return ContentServiceResult<DailyQuestionAnswerResponse>.Failure(ContentServiceStatus.Forbidden, "You can only update your own answers.");
        }

        answer.Answer = trimmed;
        answer.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<DailyQuestionAnswerResponse>.Success(new DailyQuestionAnswerResponse
        {
            Id = answer.Id,
            QuestionId = answer.QuestionId,
            DateKey = answer.CreatedAt.ToString("yyyy-MM-dd"),
            UserId = answer.UserId,
            UserDisplayName = answer.User.DisplayName ?? answer.User.Username,
            Answer = answer.Answer,
            CreatedAt = answer.CreatedAt,
            UpdatedAt = answer.UpdatedAt
        });
    }

    public async Task<ContentServiceResult<bool>> DeleteAnswerAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var answer = await _dbContext.DailyQuestionAnswers
            .FirstOrDefaultAsync(a => a.Id == id && a.CoupleId == context.CoupleId, cancellationToken);

        if (answer is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Answer not found.");
        }

        if (answer.UserId != context.UserId)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete your own answers.");
        }

        _dbContext.DailyQuestionAnswers.Remove(answer);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<bool>.Success(true);
    }

    private async Task<ContentContext> GetContentContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        if (coupleId is null)
        {
            return ContentContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (role is null)
        {
            return ContentContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return ContentContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private sealed record ContentContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static ContentContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new ContentContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static ContentContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new ContentContext(false, null, null, null, status, errorMessage);
        }
    }
}
