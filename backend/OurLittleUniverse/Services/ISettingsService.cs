using LoveUniverse.Api.DTOs.Settings;

namespace LoveUniverse.Api.Services;

public interface ISettingsService
{
    Task<ContentServiceResult<CoupleSettingsResponse>> GetSettingsAsync(CancellationToken cancellationToken = default);

    Task<ContentServiceResult<CoupleSettingsResponse>> UpdateSettingsAsync(CoupleSettingsUpdateRequest request, CancellationToken cancellationToken = default);
}
