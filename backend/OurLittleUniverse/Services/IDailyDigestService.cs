namespace LoveUniverse.Api.Services;

public interface IDailyDigestService
{
    Task<int> SendDailyDigestsAsync(CancellationToken cancellationToken = default);
    Task<bool> SendTestDailyDigestAsync(Guid coupleId, CancellationToken cancellationToken = default);
}
