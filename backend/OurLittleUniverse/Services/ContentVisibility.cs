using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

/// <summary>
/// Enforces visibility and privacy rules for couple-scoped content items.
/// Rules:
/// - Creators can always view, read, and manage their own content.
/// - Private content (VisibilityLevel.Private) and private notes can only be viewed by their creator.
/// - Locked/secret content cannot be viewed by other members until the unlock date has passed.
/// - Couple owners do not automatically bypass privacy checks for partner-private content.
/// </summary>
internal static class ContentVisibility
{
    public static bool CanView(
        VisibilityLevel visibilityLevel,
        Guid createdByUserId,
        Guid currentUserId,
        CoupleRole currentUserRole,
        DateTime? unlockDate = null)
    {
        // 1. Creator can always view their own content (even if private or locked)
        if (createdByUserId == currentUserId)
        {
            return true;
        }

        // 2. Other users cannot view secret/locked content if the unlock date is in the future
        if (unlockDate is not null && unlockDate > DateTime.UtcNow)
        {
            return false;
        }

        // 3. Evaluate visibility level for non-creators
        return visibilityLevel switch
        {
            VisibilityLevel.Shared => true,
            VisibilityLevel.PartnerOnly => true,
            VisibilityLevel.Secret => true,
            VisibilityLevel.Private => false, // Private content is creator-only
            _ => false
        };
    }

    public static bool CanSeePrivateNote(Guid createdByUserId, Guid currentUserId, CoupleRole currentUserRole)
    {
        // Private notes are strictly creator-only
        return createdByUserId == currentUserId;
    }

    public static bool CanSeeLockedLetterBody(
        Guid createdByUserId,
        Guid currentUserId,
        CoupleRole currentUserRole,
        bool isLocked,
        DateTime? openOnUtc)
    {
        // 1. Creator can always read their own letters
        if (createdByUserId == currentUserId)
        {
            return true;
        }

        // 2. Non-creators cannot view a letter that is explicitly locked
        if (isLocked)
        {
            return false;
        }

        // 3. Non-creators can view unlocked letters after the unlock date has passed
        return openOnUtc is null || openOnUtc <= DateTime.UtcNow;
    }

    public static bool IsUnlocked(DateTime? unlockDate)
    {
        return unlockDate is null || unlockDate <= DateTime.UtcNow;
    }
}

