using Xunit;
using LoveUniverse.Api.Services;
using LoveUniverse.Api.Entities.Enums;

namespace OurLittleUniverse.Tests;

public class ContentVisibilityTests
{
    private readonly Guid _creatorId = Guid.NewGuid();
    private readonly Guid _partnerId = Guid.NewGuid();

    [Fact]
    public void Owner_CannotViewPartnerPrivateNote()
    {
        // Arrange
        // Creator is Partner, viewer is Owner
        Guid createdByUserId = _partnerId;
        Guid currentUserId = _creatorId; // Owner
        CoupleRole currentUserRole = CoupleRole.Owner;

        // Act
        bool canSee = ContentVisibility.CanSeePrivateNote(createdByUserId, currentUserId, currentUserRole);

        // Assert
        Assert.False(canSee, "Couple owner should not be able to see partner's private note.");
    }

    [Fact]
    public void Owner_CannotViewLockedLetterBodyBeforeUnlock()
    {
        // Arrange
        // Creator is Partner, viewer is Owner, letter is locked
        Guid createdByUserId = _partnerId;
        Guid currentUserId = _creatorId; // Owner
        CoupleRole currentUserRole = CoupleRole.Owner;
        bool isLocked = true;
        DateTime? openOnUtc = DateTime.UtcNow.AddDays(1); // Future unlock date

        // Act
        bool canSee = ContentVisibility.CanSeeLockedLetterBody(createdByUserId, currentUserId, currentUserRole, isLocked, openOnUtc);

        // Assert
        Assert.False(canSee, "Couple owner should not be able to view partner's locked letter body before unlock.");
    }

    [Fact]
    public void Creator_CanViewOwnPrivateContent()
    {
        // Arrange & Act & Assert
        // Creator can see their own private note
        Assert.True(
            ContentVisibility.CanSeePrivateNote(_creatorId, _creatorId, CoupleRole.Owner),
            "Creator should always see their own private notes."
        );

        // Creator can see their own locked letter body
        Assert.True(
            ContentVisibility.CanSeeLockedLetterBody(_creatorId, _creatorId, CoupleRole.Owner, isLocked: true, openOnUtc: DateTime.UtcNow.AddDays(1)),
            "Creator should always see their own locked letter body."
        );

        // Creator can view their own private-visibility content
        Assert.True(
            ContentVisibility.CanView(VisibilityLevel.Private, _creatorId, _creatorId, CoupleRole.Owner, unlockDate: DateTime.UtcNow.AddDays(1)),
            "Creator should always see their own private-visibility content."
        );
    }

    [Fact]
    public void UnlockedAndSharedContent_BehavesCorrectly()
    {
        // Arrange
        Guid createdByUserId = _partnerId;
        Guid currentUserId = _creatorId; // Owner
        CoupleRole currentUserRole = CoupleRole.Owner;

        // Act & Assert
        // Shared content is visible to other couple members
        Assert.True(
            ContentVisibility.CanView(VisibilityLevel.Shared, createdByUserId, currentUserId, currentUserRole),
            "Shared content should be viewable by other couple members."
        );

        // PartnerOnly content is visible to other couple members
        Assert.True(
            ContentVisibility.CanView(VisibilityLevel.PartnerOnly, createdByUserId, currentUserId, currentUserRole),
            "PartnerOnly content should be viewable by other couple members."
        );

        // Secret content with past unlock date is visible
        Assert.True(
            ContentVisibility.CanView(VisibilityLevel.Secret, createdByUserId, currentUserId, currentUserRole, unlockDate: DateTime.UtcNow.AddMinutes(-5)),
            "Secret content with a past unlock date should be viewable."
        );

        // Secret content with future unlock date is not visible to others
        Assert.False(
            ContentVisibility.CanView(VisibilityLevel.Secret, createdByUserId, currentUserId, currentUserRole, unlockDate: DateTime.UtcNow.AddMinutes(5)),
            "Secret content with a future unlock date should not be viewable by others."
        );

        // Unlocked letter body can be read by others
        Assert.True(
            ContentVisibility.CanSeeLockedLetterBody(createdByUserId, currentUserId, currentUserRole, isLocked: false, openOnUtc: DateTime.UtcNow.AddMinutes(-5)),
            "Unlocked letter body with past open date should be viewable by others."
        );
    }
}
