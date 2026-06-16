using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Feedback;
using LoveUniverse.Api.Entities;

namespace LoveUniverse.Api.Services;

public sealed class FeedbackService : IFeedbackService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public FeedbackService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<FeedbackResponse>> CreateFeedbackAsync(
        FeedbackRequest request,
        CancellationToken cancellationToken = default)
    {
        var message = request.Message.Trim();
        if (string.IsNullOrWhiteSpace(message))
        {
            return ContentServiceResult<FeedbackResponse>.Failure(ContentServiceStatus.BadRequest, "Feedback message is required.");
        }

        // Later: add spam throttling, moderation review, and abuse reporting before public launch.
        var feedback = new FeedbackEntry
        {
            Id = Guid.NewGuid(),
            UserId = _permissionService.GetCurrentUserId(),
            Rating = request.Rating,
            Message = message,
            Email = CleanOptional(request.Email),
            Context = CleanOptional(request.Context),
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.FeedbackEntries.Add(feedback);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<FeedbackResponse>.Success(new FeedbackResponse
        {
            Id = feedback.Id,
            Message = "Thanks for helping Arova grow.",
            CreatedAt = feedback.CreatedAt
        });
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
