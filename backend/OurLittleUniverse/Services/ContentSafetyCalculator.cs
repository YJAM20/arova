using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Profile;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

internal static class ContentSafetyCalculator
{
    public static async Task<ContentSafetyResponse> GetContentSafetyAsync(
        AppDbContext dbContext,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.AppUsers
            .AsNoTracking()
            .FirstAsync(candidate => candidate.Id == userId, cancellationToken);

        var userAdultStatus = GetAdultStatus(user.DateOfBirth);
        if (userAdultStatus is not true)
        {
            return new ContentSafetyResponse
            {
                CanEnableMatureMode = false,
                MatureContentEnabled = false,
                MatureContentReason = userAdultStatus is false
                    ? "Mature mode is unavailable because this account is under 18."
                    : "Mature mode is unavailable until age is confirmed."
            };
        }

        var coupleId = await dbContext.CoupleMembers
            .AsNoTracking()
            .Where(member => member.UserId == userId && member.IsActive && member.Couple.IsActive)
            .Select(member => (Guid?)member.CoupleId)
            .FirstOrDefaultAsync(cancellationToken);

        if (coupleId is null)
        {
            return new ContentSafetyResponse
            {
                CanEnableMatureMode = true,
                MatureContentEnabled = user.MatureContentEnabled,
                MatureContentReason = "Mature mode can be enabled after age is confirmed. Couple mode also checks both partners."
            };
        }

        var memberBirthdates = await dbContext.CoupleMembers
            .AsNoTracking()
            .Where(member => member.CoupleId == coupleId.Value && member.IsActive && member.Couple.IsActive)
            .Select(member => member.User.DateOfBirth)
            .ToListAsync(cancellationToken);

        if (memberBirthdates.Any(dateOfBirth => GetAdultStatus(dateOfBirth) is not true))
        {
            return new ContentSafetyResponse
            {
                CanEnableMatureMode = false,
                MatureContentEnabled = false,
                MatureContentReason = "Mature mode requires both partners to be 18 or older with age confirmed."
            };
        }

        return new ContentSafetyResponse
        {
            CanEnableMatureMode = true,
            MatureContentEnabled = user.MatureContentEnabled,
            MatureContentReason = "Mature mode is available because age is confirmed for both partners."
        };
    }

    private static bool? GetAdultStatus(DateTime? dateOfBirth)
    {
        if (dateOfBirth is null)
        {
            return null;
        }

        return dateOfBirth.Value.Date <= DateTime.UtcNow.Date.AddYears(-18);
    }
}
