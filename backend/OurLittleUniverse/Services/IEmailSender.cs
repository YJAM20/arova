namespace LoveUniverse.Api.Services;

public interface IEmailSender
{
    Task SendVerificationCodeAsync(string destination, string code, string purpose, CancellationToken cancellationToken = default);
    Task SendEmailAsync(string toEmail, string subject, string plainTextBody, string htmlBody, CancellationToken cancellationToken = default);
}
