namespace LoveUniverse.Api.Services;

public interface ISmsSender
{
    Task<SmsSendResult> SendVerificationCodeAsync(string destination, string code, string purpose, CancellationToken cancellationToken = default);
}

public sealed record SmsSendResult(bool Succeeded, string Message);
