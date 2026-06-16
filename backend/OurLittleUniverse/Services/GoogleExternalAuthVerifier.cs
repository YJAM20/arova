using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

public sealed class GoogleExternalAuthVerifier : IExternalAuthVerifier
{
    public ExternalAuthProvider Provider => ExternalAuthProvider.Google;

    public Task<ExternalAuthVerificationResult> VerifyAsync(string idToken, CancellationToken cancellationToken = default)
    {
        // Future setup requires Google OAuth Client ID, redirect URI, and secure token validation.
        return Task.FromResult(new ExternalAuthVerificationResult(
            false,
            "External login provider is not configured in this environment."));
    }
}
