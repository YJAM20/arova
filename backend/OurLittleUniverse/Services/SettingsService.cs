using LoveUniverse.Api.Data;
using LoveUniverse.Api.DTOs.Settings;
using LoveUniverse.Api.Entities;
using LoveUniverse.Api.Entities.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoveUniverse.Api.Services;

public sealed class SettingsService : ISettingsService
{
    private readonly AppDbContext _dbContext;
    private readonly IPermissionService _permissionService;

    public SettingsService(AppDbContext dbContext, IPermissionService permissionService)
    {
        _dbContext = dbContext;
        _permissionService = permissionService;
    }

    public async Task<ContentServiceResult<CoupleSettingsResponse>> GetSettingsAsync(CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleSettingsResponse>.Failure(context.Status, context.ErrorMessage);
        }

        var settings = await GetOrCreateSettingsAsync(context.CoupleId!.Value, cancellationToken);
        return ContentServiceResult<CoupleSettingsResponse>.Success(MapSettings(settings));
    }

    public async Task<ContentServiceResult<CoupleSettingsResponse>> UpdateSettingsAsync(
        CoupleSettingsUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var context = await GetAccessContextAsync(cancellationToken);
        if (!context.Succeeded)
        {
            return ContentServiceResult<CoupleSettingsResponse>.Failure(context.Status, context.ErrorMessage);
        }

        if (context.Role != CoupleRole.Owner)
        {
            return ContentServiceResult<CoupleSettingsResponse>.Failure(
                ContentServiceStatus.Forbidden,
                "Only the owner can update couple settings.");
        }

        var settings = await GetOrCreateSettingsAsync(context.CoupleId!.Value, cancellationToken);
        settings.TimeZone = CleanRequired(request.TimeZone, "UTC");
        settings.DailyReasonsEnabled = request.DailyReasonsEnabled;
        settings.MoodTrackingEnabled = request.MoodTrackingEnabled;
        settings.PrivateByDefault = request.PrivateByDefault;
        settings.ActiveTheme = CleanRequired(request.ActiveTheme, "default");
        settings.LanguageMode = CleanLanguage(request.LanguageMode);
        settings.AnimationsEnabled = request.AnimationsEnabled;
        settings.MusicEnabled = request.MusicEnabled;
        settings.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return ContentServiceResult<CoupleSettingsResponse>.Success(MapSettings(settings));
    }

    private async Task<CoupleSettings> GetOrCreateSettingsAsync(Guid coupleId, CancellationToken cancellationToken)
    {
        var settings = await _dbContext.CoupleSettings
            .FirstOrDefaultAsync(candidate => candidate.CoupleId == coupleId, cancellationToken);

        if (settings is not null)
        {
            return settings;
        }

        settings = new CoupleSettings
        {
            Id = Guid.NewGuid(),
            CoupleId = coupleId,
            TimeZone = "UTC",
            DailyReasonsEnabled = true,
            MoodTrackingEnabled = true,
            PrivateByDefault = false,
            ActiveTheme = "default",
            LanguageMode = "en",
            AnimationsEnabled = true,
            MusicEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.CoupleSettings.Add(settings);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return settings;
    }

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

    private static CoupleSettingsResponse MapSettings(CoupleSettings settings)
    {
        return new CoupleSettingsResponse
        {
            Id = settings.Id,
            CoupleId = settings.CoupleId,
            TimeZone = settings.TimeZone,
            DailyReasonsEnabled = settings.DailyReasonsEnabled,
            MoodTrackingEnabled = settings.MoodTrackingEnabled,
            PrivateByDefault = settings.PrivateByDefault,
            ActiveTheme = settings.ActiveTheme,
            LanguageMode = settings.LanguageMode,
            AnimationsEnabled = settings.AnimationsEnabled,
            MusicEnabled = settings.MusicEnabled,
            CreatedAt = settings.CreatedAt,
            UpdatedAt = settings.UpdatedAt
        };
    }

    private static string CleanRequired(string? value, string fallback)
    {
        return string.IsNullOrWhiteSpace(value) ? fallback : value.Trim();
    }

    private static string CleanLanguage(string? value)
    {
        var normalized = string.IsNullOrWhiteSpace(value) ? "en" : value.Trim().ToLowerInvariant();
        return normalized is "en" or "ar" or "es" ? normalized : "en";
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
