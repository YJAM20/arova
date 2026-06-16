using LoveUniverse.Api.Data;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class PermissionService : IPermissionService
{
    private readonly AppDbContext _dbContext;
    private readonly ICurrentUserService _currentUserService;

    public PermissionService(AppDbContext dbContext, ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService = currentUserService;
    }

    public Guid? GetCurrentUserId()
    {
        return _currentUserService.UserId;
    }

    public async Task<Guid?> GetCurrentUserCoupleIdAsync(CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return null;
        }

        return await _dbContext.CoupleMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId.Value && member.IsActive && member.Couple.IsActive)
            .Select(member => (Guid?)member.CoupleId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CoupleRole?> GetCurrentUserRoleAsync(CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return null;
        }

        return await _dbContext.CoupleMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId.Value && member.IsActive && member.Couple.IsActive)
            .Select(member => (CoupleRole?)member.Role)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<bool> IsCurrentUserOwnerAsync(CancellationToken cancellationToken = default)
    {
        return await GetCurrentUserRoleAsync(cancellationToken) == CoupleRole.Owner;
    }

    public async Task<bool> EnsureUserBelongsToCoupleAsync(Guid coupleId, CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return false;
        }

        return await _dbContext.CoupleMembers
            .AsNoTracking()
            .AnyAsync(
                member => member.UserId == userId.Value
                    && member.CoupleId == coupleId
                    && member.IsActive
                    && member.Couple.IsActive,
                cancellationToken);
    }

    public async Task<bool> CanEditContentAsync(Guid createdByUserId, CancellationToken cancellationToken = default)
    {
        var userId = GetCurrentUserId();
        if (userId is null)
        {
            return false;
        }

        if (createdByUserId == userId.Value)
        {
            return true;
        }

        return await IsCurrentUserOwnerAsync(cancellationToken);
    }
}
