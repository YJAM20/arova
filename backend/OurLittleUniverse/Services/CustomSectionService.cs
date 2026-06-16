using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.CustomSections;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class CustomSectionService : ICustomSectionService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public CustomSectionService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<IReadOnlyList<CustomSectionResponse>>> GetSectionsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<IReadOnlyList<CustomSectionResponse>>.Failure(context.Status, context.ErrorMessage);
        }

        var sections = await _dbContext.Set<CustomSection>()
            .AsNoTracking()
            .Include(s => s.Items)
            .Where(s => s.CoupleId == context.CoupleId)
            .OrderBy(s => s.CreatedAt)
            .ToListAsync(cancellationToken);

        var responses = sections.Select(MapSection).ToList();
        return ContentServiceResult<IReadOnlyList<CustomSectionResponse>>.Success(responses);
    }

    public async Task<ContentServiceResult<CustomSectionResponse>> CreateSectionAsync(CreateCustomSectionRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(ContentServiceStatus.BadRequest, "Title is required.");
        }

        var existingCount = await _dbContext.Set<CustomSection>()
            .CountAsync(s => s.CoupleId == context.CoupleId, cancellationToken);

        var subscription = await _dbContext.CoupleSubscriptions
            .AsNoTracking()
            .Where(s => s.CoupleId == context.CoupleId && s.Status == "Active")
            .OrderByDescending(s => s.PlanType)
            .FirstOrDefaultAsync(cancellationToken);

        var planType = subscription?.PlanType ?? SubscriptionPlanType.Free;
        var limit = GetSectionLimit(planType);

        if (existingCount >= limit)
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(
                ContentServiceStatus.Forbidden,
                "You have reached the limit for your current plan. Upgrade to create more custom sections.");
        }

        var now = DateTime.UtcNow;
        var section = new CustomSection
        {
            Id = Guid.NewGuid(),
            CoupleId = context.CoupleId!.Value,
            CreatedByUserId = context.UserId!.Value,
            Title = title,
            Description = CleanOptional(request.Description),
            Icon = CleanOptional(request.Icon),
            VisibilityLevel = request.VisibilityLevel,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Set<CustomSection>().Add(section);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CustomSectionResponse>.Success(MapSection(section));
    }

    public async Task<ContentServiceResult<CustomSectionResponse>> UpdateSectionAsync(Guid id, UpdateCustomSectionRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var title = request.Title?.Trim();
        if (string.IsNullOrWhiteSpace(title))
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(ContentServiceStatus.BadRequest, "Title is required.");
        }

        var section = await _dbContext.Set<CustomSection>()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id && s.CoupleId == context.CoupleId, cancellationToken);

        if (section is null)
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(ContentServiceStatus.NotFound, "Section not found.");
        }

        if (!await _permissionService.CanEditContentAsync(section.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(ContentServiceStatus.Forbidden, "You do not have permission to edit this section.");
        }

        section.Title = title;
        section.Description = CleanOptional(request.Description);
        section.Icon = CleanOptional(request.Icon);
        section.VisibilityLevel = request.VisibilityLevel;
        section.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CustomSectionResponse>.Success(MapSection(section));
    }

    public async Task<ContentServiceResult<CustomSectionResponse>> DeleteSectionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var section = await _dbContext.Set<CustomSection>()
            .Include(s => s.Items)
            .FirstOrDefaultAsync(s => s.Id == id && s.CoupleId == context.CoupleId, cancellationToken);

        if (section is null)
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(ContentServiceStatus.NotFound, "Section not found.");
        }

        if (!await _permissionService.CanEditContentAsync(section.CreatedByUserId, cancellationToken))
        {
            return ContentServiceResult<CustomSectionResponse>.Failure(ContentServiceStatus.Forbidden, "You do not have permission to delete this section.");
        }

        var response = MapSection(section);
        _dbContext.Set<CustomSection>().Remove(section);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CustomSectionResponse>.Success(response);
    }

    public async Task<ContentServiceResult<CustomSectionItemResponse>> AddItemAsync(Guid sectionId, CreateCustomSectionItemRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var text = request.Text?.Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.BadRequest, "Item text is required.");
        }

        var section = await _dbContext.Set<CustomSection>()
            .FirstOrDefaultAsync(s => s.Id == sectionId && s.CoupleId == context.CoupleId, cancellationToken);

        if (section is null)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.NotFound, "Section not found.");
        }

        var now = DateTime.UtcNow;
        var item = new CustomSectionItem
        {
            Id = Guid.NewGuid(),
            CustomSectionId = sectionId,
            Text = text,
            IsCompleted = false,
            SortOrder = request.SortOrder,
            CreatedAt = now,
            UpdatedAt = now
        };

        _dbContext.Set<CustomSectionItem>().Add(item);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CustomSectionItemResponse>.Success(MapItem(item));
    }

    public async Task<ContentServiceResult<CustomSectionItemResponse>> UpdateItemAsync(Guid sectionId, Guid itemId, UpdateCustomSectionItemRequest request, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var text = request.Text?.Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.BadRequest, "Item text is required.");
        }

        var section = await _dbContext.Set<CustomSection>()
            .FirstOrDefaultAsync(s => s.Id == sectionId && s.CoupleId == context.CoupleId, cancellationToken);

        if (section is null)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.NotFound, "Section not found.");
        }

        var item = await _dbContext.Set<CustomSectionItem>()
            .FirstOrDefaultAsync(i => i.Id == itemId && i.CustomSectionId == sectionId, cancellationToken);

        if (item is null)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.NotFound, "Item not found in the specified section.");
        }

        item.Text = text;
        item.IsCompleted = request.IsCompleted;
        item.SortOrder = request.SortOrder;
        item.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CustomSectionItemResponse>.Success(MapItem(item));
    }

    public async Task<ContentServiceResult<CustomSectionItemResponse>> DeleteItemAsync(Guid sectionId, Guid itemId, CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var section = await _dbContext.Set<CustomSection>()
            .FirstOrDefaultAsync(s => s.Id == sectionId && s.CoupleId == context.CoupleId, cancellationToken);

        if (section is null)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.NotFound, "Section not found.");
        }

        var item = await _dbContext.Set<CustomSectionItem>()
            .FirstOrDefaultAsync(i => i.Id == itemId && i.CustomSectionId == sectionId, cancellationToken);

        if (item is null)
        {
            return ContentServiceResult<CustomSectionItemResponse>.Failure(ContentServiceStatus.NotFound, "Item not found in the specified section.");
        }

        var response = MapItem(item);
        _dbContext.Set<CustomSectionItem>().Remove(item);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CustomSectionItemResponse>.Success(response);
    }

    private static int GetSectionLimit(SubscriptionPlanType planType) => planType switch
    {
        SubscriptionPlanType.Pro => 5,
        SubscriptionPlanType.Platinum => 20,
        _ => 1
    };

    private async Task<AccessContext> GetAccessContextAsync(CancellationToken cancellationToken)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return AccessContext.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        var role = await _permissionService.GetCurrentUserRoleAsync(cancellationToken);
        if (coupleId is null || role is null)
        {
            return AccessContext.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        return AccessContext.Success(userId.Value, coupleId.Value, role.Value);
    }

    private static CustomSectionResponse MapSection(CustomSection section)
    {
        return new CustomSectionResponse
        {
            Id = section.Id,
            Title = section.Title,
            Description = section.Description,
            Icon = section.Icon,
            VisibilityLevel = section.VisibilityLevel,
            CreatedByUserId = section.CreatedByUserId,
            CreatedAt = section.CreatedAt,
            UpdatedAt = section.UpdatedAt,
            Items = section.Items is null ? [] : section.Items.OrderBy(i => i.SortOrder).ThenBy(i => i.CreatedAt).Select(MapItem).ToList()
        };
    }

    private static CustomSectionItemResponse MapItem(CustomSectionItem item)
    {
        return new CustomSectionItemResponse
        {
            Id = item.Id,
            Text = item.Text,
            IsCompleted = item.IsCompleted,
            SortOrder = item.SortOrder,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private sealed record AccessContext(
        bool Succeeded,
        Guid? UserId,
        Guid? CoupleId,
        CoupleRole? Role,
        ContentServiceStatus Status,
        string ErrorMessage)
    {
        public static AccessContext Success(Guid userId, Guid coupleId, CoupleRole role)
        {
            return new AccessContext(true, userId, coupleId, role, ContentServiceStatus.Success, string.Empty);
        }

        public static AccessContext Failure(ContentServiceStatus status, string errorMessage)
        {
            return new AccessContext(false, null, null, null, status, errorMessage);
        }
    }
}
