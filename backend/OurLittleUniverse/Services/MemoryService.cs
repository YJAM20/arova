using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Memories;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class MemoryService : IMemoryService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public MemoryService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<MemoryResponse>>> GetMemoriesAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<MemoryResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var memories = await _dbContext.Memories
            .AsNoTracking()
            .Include(memory => memory.CreatedByUser)
            .Where(memory => memory.CoupleId == context.CoupleId)
            .OrderByDescending(memory => memory.MemoryDate ?? memory.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = memories
            .Where(memory => CanView(memory, context))
            .Select(memory => MapMemory(memory, context))
            .ToList();

        return ContentServiceResult<IReadOnlyList<MemoryResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<MemoryResponse>> GetMemoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<MemoryResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var memory = await _dbContext.Memories
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (memory is null || !CanView(memory, context))
        {
            return ContentServiceResult<MemoryResponse>.Failure(ContentServiceStatus.NotFound, "Memory was not found.");
        }

        return ContentServiceResult<MemoryResponse>.Success(MapMemory(memory, context));
    }

    public async Task<ContentServiceResult<MemoryResponse>> CreateMemoryAsync(
        MemoryCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<MemoryResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<MemoryResponse>.Failure(ContentServiceStatus.BadRequest, "Memory title is required.");
        }

        var now = DateTime.UtcNow;
        var memory = new Memory
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = title,
            Description = CleanOptional(request.Description),
            PrivateNote = CleanOptional(request.PrivateNote),
            MemoryDate = request.MemoryDate,
            Location = CleanOptional(request.Location),
            MediaUrl = CleanOptional(request.MediaUrl),
            VisibilityLevel = request.VisibilityLevel,
            CreatedAt = now
        };

        _dbContext.Memories.Add(memory);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var created = await _dbContext.Memories
            .AsNoTracking()
            .Include(candidate => candidate.CreatedByUser)
            .FirstAsync(candidate => candidate.Id == memory.Id, cancellationToken);

        return ContentServiceResult<MemoryResponse>.Success(MapMemory(created, context));
    }

    public async Task<ContentServiceResult<MemoryResponse>> UpdateMemoryAsync(
        Guid id,
        MemoryUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<MemoryResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var memory = await _dbContext.Memories
            .Include(candidate => candidate.CreatedByUser)
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (memory is null)
        {
            return ContentServiceResult<MemoryResponse>.Failure(ContentServiceStatus.NotFound, "Memory was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(memory.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<MemoryResponse>.Failure(ContentServiceStatus.Forbidden, "You can only edit memories you created.");
        }

        var title = request.Title.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<MemoryResponse>.Failure(ContentServiceStatus.BadRequest, "Memory title is required.");
        }

        memory.Title = title;
        memory.Description = CleanOptional(request.Description);
        memory.PrivateNote = CleanOptional(request.PrivateNote);
        memory.MemoryDate = request.MemoryDate;
        memory.Location = CleanOptional(request.Location);
        memory.MediaUrl = CleanOptional(request.MediaUrl);
        memory.VisibilityLevel = request.VisibilityLevel;
        memory.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<MemoryResponse>.Success(MapMemory(memory, context));
    }

    public async Task<ContentServiceResult<bool>> DeleteMemoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetContentContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<bool>.Failure(context.Status, context.ErrorMessage);
        }

        var memory = await _dbContext.Memories
            .FirstOrDefaultAsync(candidate => candidate.Id == id && candidate.CoupleId == context.CoupleId, cancellationToken);

        if (memory is null)
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.NotFound, "Memory was not found.");
        }

        if (!await _permissionService.CanEditContentAsync(memory.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<bool>.Failure(ContentServiceStatus.Forbidden, "You can only delete memories you created.");
        }

        _dbContext.Memories.Remove(memory);
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

    private static bool CanView(Memory memory, ContentContext context)
    {
        return ContentVisibility.CanView(
            memory.VisibilityLevel,
            memory.CreatedByUserId,
            context.UserId!.Value,
            context.Role!.Value);
    }

    private static MemoryResponse MapMemory(Memory memory, ContentContext context)
    {
        var canSeePrivateNote = ContentVisibility.CanSeePrivateNote(
            memory.CreatedByUserId,
            context.UserId!.Value,
            context.Role!.Value);

        return new MemoryResponse
        {
            Id = memory.Id,
            Title = memory.Title,
            Description = memory.Description,
            PrivateNote = canSeePrivateNote ? memory.PrivateNote : null,
            IsPrivateNoteHidden = !canSeePrivateNote && !string.IsNullOrWhiteSpace(memory.PrivateNote),
            MemoryDate = memory.MemoryDate,
            Location = memory.Location,
            MediaUrl = memory.MediaUrl,
            VisibilityLevel = memory.VisibilityLevel,
            CreatedByUserId = memory.CreatedByUserId,
            CreatedByDisplayName = memory.CreatedByUser.DisplayName ?? memory.CreatedByUser.Username,
            CreatedAt = memory.CreatedAt,
            UpdatedAt = memory.UpdatedAt
        };
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
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
