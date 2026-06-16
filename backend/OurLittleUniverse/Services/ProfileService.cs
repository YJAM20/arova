using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Profile;
using LoveUniverse.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class ProfileService : IProfileService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public ProfileService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<UserProfileResponse>> GetMyProfileAsync(CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<UserProfileResponse>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var profile = await GetOrCreateProfileAsync(userId.Value, cancellationToken);
        return ContentServiceResult<UserProfileResponse>.Success(MapProfile(profile));
    }

    public async Task<ContentServiceResult<UserProfileResponse>> UpsertMyProfileAsync(
        UserProfileUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<UserProfileResponse>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var displayName = request.DisplayName.Trim();
        if (string.IsNullOrWhiteSpace(displayName))
        {
            return ContentServiceResult<UserProfileResponse>.Failure(ContentServiceStatus.BadRequest, "Display name is required.");
        }

        var language = NormalizeLanguage(request.PreferredLanguage);
        var now = DateTime.UtcNow;
        var profile = await GetOrCreateProfileAsync(userId.Value, cancellationToken);
        var user = await _dbContext.AppUsers.FirstAsync(candidate => candidate.Id == userId.Value, cancellationToken);

        profile.DisplayName = displayName;
        profile.DateOfBirth = request.DateOfBirth;
        profile.AgeRange = CleanOptional(request.AgeRange);
        profile.RelationshipStatus = CleanOptional(request.RelationshipStatus);
        profile.RelationshipType = CleanOptional(request.RelationshipType);
        profile.PersonalityStyle = CleanOptional(request.PersonalityStyle);
        profile.LoveLanguage = CleanOptional(request.LoveLanguage);
        profile.PreferredTheme = CleanOptional(request.PreferredTheme);
        profile.PreferredLanguage = language;
        profile.AvatarUrl = CleanOptional(request.AvatarUrl);
        profile.Bio = CleanOptional(request.Bio);
        profile.UpdatedAt = now;

        user.DisplayName = displayName;
        user.AvatarUrl = profile.AvatarUrl;
        user.DateOfBirth = request.DateOfBirth;
        user.AgeRange = CleanOptional(request.AgeRange);
        user.UpdatedAt = now;

        if (request.DateOfBirth is null || request.DateOfBirth.Value.Date > DateTime.UtcNow.Date.AddYears(-18))
        {
            profile.MatureContentEnabled = false;
            user.MatureContentEnabled = false;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return ContentServiceResult<UserProfileResponse>.Success(MapProfile(profile));
    }

    public async Task<ContentServiceResult<ContentSafetyResponse>> GetContentSafetyAsync(CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<ContentSafetyResponse>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        return ContentServiceResult<ContentSafetyResponse>.Success(
            await ContentSafetyCalculator.GetContentSafetyAsync(_dbContext, userId.Value, cancellationToken));
    }

    public async Task<ContentServiceResult<ContentSafetyResponse>> UpdateMatureContentAsync(
        MatureContentUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<ContentSafetyResponse>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var safety = await ContentSafetyCalculator.GetContentSafetyAsync(_dbContext, userId.Value, cancellationToken);
        if (request.MatureContentEnabled && !safety.CanEnableMatureMode)
        {
            return ContentServiceResult<ContentSafetyResponse>.Failure(ContentServiceStatus.Forbidden, safety.MatureContentReason);
        }

        var user = await _dbContext.AppUsers.FirstAsync(candidate => candidate.Id == userId.Value, cancellationToken);
        var profile = await GetOrCreateProfileAsync(userId.Value, cancellationToken);
        user.MatureContentEnabled = request.MatureContentEnabled;
        user.UpdatedAt = DateTime.UtcNow;
        profile.MatureContentEnabled = request.MatureContentEnabled;
        profile.UpdatedAt = user.UpdatedAt.Value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<ContentSafetyResponse>.Success(
            await ContentSafetyCalculator.GetContentSafetyAsync(_dbContext, userId.Value, cancellationToken));
    }

    private async Task<UserProfile> GetOrCreateProfileAsync(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await _dbContext.UserProfiles
            .FirstOrDefaultAsync(candidate => candidate.UserId == userId, cancellationToken);

        if (profile is not null)
        {
            return profile;
        }

        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .FirstAsync(candidate => candidate.Id == userId, cancellationToken);

        profile = new UserProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DisplayName = user.DisplayName ?? user.Username,
            DateOfBirth = user.DateOfBirth,
            AgeRange = user.AgeRange,
            PreferredLanguage = "en",
            AvatarUrl = user.AvatarUrl,
            MatureContentEnabled = false,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.UserProfiles.Add(profile);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return profile;
    }

    private static UserProfileResponse MapProfile(UserProfile profile)
    {
        return new UserProfileResponse
        {
            Id = profile.Id,
            UserId = profile.UserId,
            DisplayName = profile.DisplayName,
            DateOfBirth = profile.DateOfBirth,
            AgeRange = profile.AgeRange,
            RelationshipStatus = profile.RelationshipStatus,
            RelationshipType = profile.RelationshipType,
            PersonalityStyle = profile.PersonalityStyle,
            LoveLanguage = profile.LoveLanguage,
            PreferredTheme = profile.PreferredTheme,
            PreferredLanguage = NormalizeLanguage(profile.PreferredLanguage),
            AvatarUrl = profile.AvatarUrl,
            Bio = profile.Bio,
            MatureContentEnabled = profile.MatureContentEnabled,
            UpdatedAt = profile.UpdatedAt
        };
    }

    private static string NormalizeLanguage(string? value)
    {
        var normalized = string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
        return normalized is "en" or "ar" or "es" ? normalized : "en";
    }

    private static string? CleanOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    public async Task<ContentServiceResult<ProfileStatsResponse>> GetProfileStatsAsync(CancellationToken cancellationToken = default)
    {
        var userId = _permissionService.GetCurrentUserId();
        if (userId is null)
        {
            return ContentServiceResult<ProfileStatsResponse>.Failure(ContentServiceStatus.Unauthorized, "Please sign in to continue.");
        }

        var coupleId = await _permissionService.GetCurrentUserCoupleIdAsync(cancellationToken);
        if (coupleId is null)
        {
            return ContentServiceResult<ProfileStatsResponse>.Failure(ContentServiceStatus.NotFound, "Create or join a couple space first.");
        }

        var user = await _dbContext.AppUsers
            .AsNoTracking()
            .Include(u => u.Profile)
            .FirstAsync(candidate => candidate.Id == userId, cancellationToken);

        var couple = await _dbContext.Couples
            .AsNoTracking()
            .FirstAsync(c => c.Id == coupleId, cancellationToken);

        var totalPoints = await _dbContext.Set<RelationshipPointLedger>()
            .AsNoTracking()
            .Where(ledger => ledger.CoupleId == coupleId)
            .SumAsync(ledger => ledger.Points, cancellationToken);

        var ranks = new (string Rank, int Threshold)[]
        {
            ("Spark", 0),
            ("Warmth", 100),
            ("Orbit", 250),
            ("Bond", 500),
            ("Constellation", 1000),
            ("Gravity", 1750),
            ("Eclipse", 3000),
            ("Eternal Orbit", 5000)
        };

        string currentRank = "Spark";
        string? nextRank = null;

        for (int i = 0; i < ranks.Length; i++)
        {
            if (totalPoints >= ranks[i].Threshold)
            {
                currentRank = ranks[i].Rank;
            }
        }

        for (int i = 0; i < ranks.Length; i++)
        {
            if (ranks[i].Threshold > totalPoints)
            {
                nextRank = ranks[i].Rank;
                break;
            }
        }

        var memoriesCount = await _dbContext.Memories.CountAsync(m => m.CoupleId == coupleId, cancellationToken);
        var lettersCount = await _dbContext.Letters.CountAsync(l => l.CoupleId == coupleId, cancellationToken);
        var reasonsCount = await _dbContext.Reasons.CountAsync(r => r.CoupleId == coupleId, cancellationToken);
        var chatMessagesCount = await _dbContext.ChatMessages.CountAsync(m => m.CoupleId == coupleId, cancellationToken);
        
        var planetCompletions = await _dbContext.Set<DailyPlanetTaskCompletion>()
            .CountAsync(c => c.DailyCouplePlanet.CoupleId == coupleId, cancellationToken);

        var relationshipLengthDays = (DateTime.UtcNow - couple.CreatedAt).Days;

        var stats = new ProfileStatsResponse
        {
            DisplayName = user.DisplayName ?? user.Username,
            Username = user.Username,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Profile?.Bio,
            RelationshipLengthDays = relationshipLengthDays,
            RelationshipStartedAt = couple.CreatedAt,
            TotalPoints = totalPoints,
            CurrentRank = currentRank,
            NextRank = nextRank,
            MemoriesCount = memoriesCount,
            LettersCount = lettersCount,
            ReasonsCount = reasonsCount,
            PlanetCompletions = planetCompletions,
            ChatMessagesCount = chatMessagesCount
        };

        return ContentServiceResult<ProfileStatsResponse>.Success(stats);
    }
}
