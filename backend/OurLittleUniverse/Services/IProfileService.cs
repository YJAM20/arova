using LoveUniverse.Api.DTOs.Profile;

namespace LoveUniverse.Api.Services;

public interface IProfileService
{
    Task<ContentServiceResult<UserProfileResponse>> GetMyProfileAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<UserProfileResponse>> UpsertMyProfileAsync(UserProfileUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ContentSafetyResponse>> GetContentSafetyAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ContentSafetyResponse>> UpdateMatureContentAsync(MatureContentUpdateRequest request, CancellationToken cancellationToken = default);

    Task<ContentServiceResult<ProfileStatsResponse>> GetProfileStatsAsync(CancellationToken cancellationToken = default);
}
