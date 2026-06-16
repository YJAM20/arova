using LoveUniverse.Api.Entities.Enums;

namespace LoveUniverse.Api.Services;

public interface IExternalAuthVerifier
{
    ExternalAuthProvider Provider { get; }

    Task<ExternalAuthVerificationResult> VerifyAsync(string idToken, CancellationToken cancellationToken = default);
}

public sealed record ExternalAuthVerificationResult(bool Succeeded, string Message);
