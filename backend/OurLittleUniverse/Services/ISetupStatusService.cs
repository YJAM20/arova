using LoveUniverse.Api.DTOs.Profile;

namespace LoveUniverse.Api.Services;

public interface ISetupStatusService
{
    Task<SetupStatusResponse> GetSetupStatusAsync(Guid userId, CancellationToken cancellationToken = default);
}
