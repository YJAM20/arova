namespace LoveUniverse.Api.Services;

public sealed class ConsoleEmailSender : IEmailSender
{
    private readonly ILogger<ConsoleEmailSender> _logger;

    public ConsoleEmailSender(ILogger<ConsoleEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendVerificationCodeAsync(string destination, string code, string purpose, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Development email verification code for {Destination} and purpose {Purpose}: {Code}",
            destination,
            purpose,
            code);

        return Task.CompletedTask;
    }
}
