using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

public interface IPermissionService
{
    Guid? GetCurrentUserId();

    Task<Guid?> GetCurrentUserCoupleIdAsync(CancellationToken cancellationToken = default);

    Task<CoupleRole?> GetCurrentUserRoleAsync(CancellationToken cancellationToken = default);

    Task<bool> IsCurrentUserOwnerAsync(CancellationToken cancellationToken = default);

    Task<bool> EnsureUserBelongsToCoupleAsync(Guid coupleId, CancellationToken cancellationToken = default);

    Task<bool> CanEditContentAsync(Guid createdByUserId, CancellationToken cancellationToken = default);
}
