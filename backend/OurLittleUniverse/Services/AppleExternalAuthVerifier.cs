using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

public sealed class AppleExternalAuthVerifier : IExternalAuthVerifier
{
    public ExternalAuthProvider Provider => ExternalAuthProvider.Apple;

    public Task<ExternalAuthVerificationResult> VerifyAsync(string idToken, CancellationToken cancellationToken = default)
    {
        // Future setup requires Apple Services ID, Team ID, Key ID, redirect URI, and secure token validation.
        return Task.FromResult(new ExternalAuthVerificationResult(
            false,
            "External login provider is not configured in this environment."));
    }
}
