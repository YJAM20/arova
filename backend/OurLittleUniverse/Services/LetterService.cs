using LoveUniverse.Api.Auth;
using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Letters;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class LetterService : ILetterService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;
    private readonly IPasswordHasherService _passwordHasher;

    public LetterService(
        AppDbContext dbContext,
        IPermissionService permissionService,
        IPasswordHasherService passwordHasher)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
        _passwordHasher = passwordHasher;
    }

    public async Task<ContentServiceResult<IReadOnlyList<LetterResponse>>> GetLettersAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<LetterResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var letters = await _dbContext.Letters
            .AsNoTracking()
            .Include(letter => letter.CreatedByUser)
            .Where(letter => letter.CoupleId == context.CoupleId)
            .OrderByDescending(letter => letter.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = letters
            .Where(letter => CanView(letter, context))
            .Select(letter => MapLetter(letter, context))
            .ToList();

        return ContentServiceResult<IReadOnlyList<LetterResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<LetterResponse>> GetLetterAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<LetterResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var letter = await _dbContext.Letters
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (letter is null || !CanView(letter, context))
        {
            return ContentServiceResult<LetterResponse>.Failure(ContentServiceStatus.NotFound, "Letter was not found.");
        }

        return ContentServiceResult<LetterResponse>.Success(MapLetter(letter, context));
    }

    public async Task<ContentServiceResult<LetterResponse>> CreateLetterAsync(
        LetterCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<LetterResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title.Trim();
        var body = request.Body.Trim();
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(body))
        {
            return ContentServiceResult<LetterResponse>.Failure(ContentServiceStatus.BadRequest, "Letter title and body are required.");
        }

        var passcodeHash = HashPasscodeIfPresent(request.Passcode);
        var now = DateTime.UtcNow;
        var letter = new Letter
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = title,
            Body = body,
            VisibilityLevel = request.VisibilityLevel,
            OpenOnUtc = request.OpenOnUtc,
            IsLocked = request.IsLocked || passcodeHash is not null,
            PasscodeHash = passcodeHash,
            CreatedAt = now
        };

        _dbContext.Letters.Add(letter);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.Letters
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstAsync(candidate => candidate.Id == letter.Id, cancellationToken);

        return ContentServiceResult<LetterResponse>.Success(MapLetter(created, context));
    }

    public async Task<ContentServiceResult<LetterResponse>> UpdateLetterAsync(
        Guid id,
        LetterUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<LetterResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var letter = await _dbContext.Letters
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (letter is null)
        {
            return ContentServiceResult<LetterResponse>.Failure(ContentServiceStatus.NotFound, "Letter was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(letter.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<LetterResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit letters you created.");
        }

        var title = request.Title.Trim();
        var body = request.Body.Trim();
        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(body))
        {
            return ContentServiceResult<LetterResponse>.Failure(ContentServiceStatus.BadRequest, "Letter title and body are required.");
        }

        var newPasscodeHash = HashPasscodeIfPresent(request.Passcode);
        letter.Title = title;
        letter.Body = body;
        letter.VisibilityLevel = request.VisibilityLevel;
        letter.OpenOnUtc = request.OpenOnUtc;
        letter.IsLocked = request.IsLocked || newPasscodeHash is not null;

        if (newPasscodeHash is not null)
        {
            letter.PasscodeHash = newPasscodeHash;
        }
        else if (!letter.IsLocked)
        {
            letter.PasscodeHash = null;
        }

        letter.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<LetterResponse>.Success(MapLetter(letter, context));
    }

    public async Task<ContentServiceResult<bool>> DeleteLetterAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var letter = await _dbContext.Letters
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (letter is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Letter was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(letter.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete letters you created.");
        }

        _dbContext.Letters.Remove(letter);
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

    private static bool CanView(Letter letter, ContentContext context)
    {
        return ContentVisibility.CanView(
            letter.VisibilityLevel,
            letter.CreatedByUserId,
            context.UserId!.Value,
            context.Role!.Value);
    }

    private static LetterResponse MapLetter(Letter letter, ContentContext context)
    {
        var canSeeBody = ContentVisibility.CanSeeLockedLetterBody(
            letter.CreatedByUserId,
            context.UserId!.Value,
            context.Role!.Value,
            letter.IsLocked,
            letter.OpenOnUtc);

        return new LetterResponse
        {
            Id = letter.Id,
            Title = letter.Title,
            Body = canSeeBody ? letter.Body : null,
            IsBodyHidden = !canSeeBody,
            VisibilityLevel = letter.VisibilityLevel,
            OpenOnUtc = letter.OpenOnUtc,
            ReadAt = letter.ReadAt,
            IsLocked = letter.IsLocked || (letter.OpenOnUtc is not null && letter.OpenOnUtc > DateTime.UtcNow),
            HasPasscode = !string.IsNullOrWhiteSpace(letter.PasscodeHash),
            CreatedByUserId = letter.CreatedByUserId,
            CreatedByDisplayName = letter.CreatedByUser.DisplayName ?? letter.CreatedByUser.Username,
            CreatedAt = letter.CreatedAt,
            UpdatedAt = letter.UpdatedAt
        };
    }

    private string? HashPasscodeIfPresent(string? passcode)
    {
        return string.IsNullOrWhiteSpace(passcode) ? null : _passwordHasher.HashPassword(passcode.Trim());
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
