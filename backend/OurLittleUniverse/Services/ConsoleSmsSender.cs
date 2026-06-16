namespace LoveUniverse.Api.Services;

public sealed class ConsoleSmsSender : ISmsSender
{
    public Task<SmsSendResult> SendVerificationCodeAsync(
        string destination,
        string code,
        string purpose,
        CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new SmsSendResult(
            false,
            "Phone verification is not available in this environment yet. Please use email verification for now."));
    }
}
