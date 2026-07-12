using Google.Apis.Auth;
using LoveUniverse.Api.Entities.Enums;
using LoveUniverse.Api.Options;
using Microsoft.Extensions.Options;

namespace LoveUniverse.Api.Services;

public sealed class GoogleExternalAuthVerifier : IExternalAuthVerifier
{
    private readonly GoogleAuthOptions _options;
    private readonly ILogger<GoogleExternalAuthVerifier> _logger;

    public GoogleExternalAuthVerifier(
        IOptions<GoogleAuthOptions> options,
        ILogger<GoogleExternalAuthVerifier> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public ExternalAuthProvider Provider => ExternalAuthProvider.Google;

    public async Task<ExternalAuthVerificationResult> VerifyAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.GoogleClientId))
        {
            _logger.LogWarning("Google OAuth validation requested, but GoogleClientId is not configured.");
            return new ExternalAuthVerificationResult(false, "Google Client ID is not configured on the server.");
        }

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _options.GoogleClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            _logger.LogInformation("Successfully verified Google ID token for email: {Email}", payload.Email);
            
            return new ExternalAuthVerificationResult(true, $"Successfully verified Google login for {payload.Email} ({payload.Name}).");
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogError(ex, "Failed to verify Google ID token signature or claims.");
            return new ExternalAuthVerificationResult(false, $"Token validation failed: {ex.Message}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected exception occurred while verifying Google token.");
            return new ExternalAuthVerificationResult(false, $"Verification failed due to an internal error.");
        }
    }
}
