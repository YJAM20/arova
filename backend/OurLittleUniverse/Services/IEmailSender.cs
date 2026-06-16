namespace LoveUniverse.Api.Services;

public interface IEmailSender
{
    Task SendVerificationCodeAsync(string destination, string code, string purpose, CancellationToken cancellationToken = default);
}
