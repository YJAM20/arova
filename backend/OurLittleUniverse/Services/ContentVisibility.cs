using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

internal static class ContentVisibility
{
    public static bool CanView(
        VisibilityLevel visibilityLevel,
        Guid createdByUserId,
        Guid currentUserId,
        CoupleRole currentUserRole,
        DateTime? unlockDate = null)
    {
        if (currentUserRole == CoupleRole.Owner || createdByUserId == currentUserId)
        {
            return true;
        }

        if (unlockDate is not null && unlockDate > DateTime.UtcNow)
        {
            return false;
        }

        return visibilityLevel switch
        {
            VisibilityLevel.Shared => true,
            VisibilityLevel.PartnerOnly => currentUserRole == CoupleRole.Partner,
            VisibilityLevel.Secret => unlockDate is not null && unlockDate <= DateTime.UtcNow,
            _ => false
        };
    }

    public static bool CanSeePrivateNote(Guid createdByUserId, Guid currentUserId, CoupleRole currentUserRole)
    {
        return currentUserRole == CoupleRole.Owner || createdByUserId == currentUserId;
    }

    public static bool CanSeeLockedLetterBody(
        Guid createdByUserId,
        Guid currentUserId,
        CoupleRole currentUserRole,
        bool isLocked,
        DateTime? openOnUtc)
    {
        if (currentUserRole == CoupleRole.Owner || createdByUserId == currentUserId)
        {
            return true;
        }

        if (isLocked)
        {
            return false;
        }

        return openOnUtc is null || openOnUtc <= DateTime.UtcNow;
    }

    public static bool IsUnlocked(DateTime? unlockDate)
    {
        return unlockDate is null || unlockDate <= DateTime.UtcNow;
    }
}
