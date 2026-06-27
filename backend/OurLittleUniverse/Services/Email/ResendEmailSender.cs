using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LoveUniverse.Api.Services.Email;

public sealed class ResendEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ResendEmailSender> _logger;

    public ResendEmailSender(
        IOptions<EmailOptions> options,
        IHttpClientFactory httpClientFactory,
        ILogger<ResendEmailSender> logger)
    {
        _options = options.Value;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task SendVerificationCodeAsync(string destination, string code, string purpose, CancellationToken cancellationToken = default)
    {
        var subject = $"[{_options.FromName}] Verification Code - {code}";
        
        var plainText = $"Your Arova verification code is: {code}\n\nThis code is for {purpose} and will expire in 10 minutes.\n\nIf you did not request this code, please ignore this email.";
        
        var html = $@"
        <div style=""font-family: 'Outfit', 'Inter', system-ui, sans-serif; max-width: 580px; margin: 0 auto; padding: 40px 20px; background-color: #051424; color: #F8F9FA; border-radius: 16px; border: 1px solid #1E293B; text-align: center;"">
            <h1 style=""color: #D6B76A; font-size: 2.2rem; margin-bottom: 24px; font-weight: 700; letter-spacing: -0.025em;"">✦ {_options.FromName} ✦</h1>
            <div style=""background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 32px; margin-bottom: 24px;"">
                <p style=""font-size: 1.1rem; color: #E2E8F0; margin-top: 0; margin-bottom: 16px;"">Your verification code for <strong>{purpose}</strong> is:</p>
                <div style=""font-size: 2.8rem; font-weight: 800; letter-spacing: 6px; color: #D6B76A; background: rgba(214, 183, 106, 0.08); border: 1px solid rgba(214, 183, 106, 0.2); border-radius: 8px; display: inline-block; padding: 12px 32px; margin: 16px 0;"">{code}</div>
                <p style=""font-size: 0.9rem; color: #94A3B8; margin-top: 16px; margin-bottom: 0;"">This code is active for 10 minutes. Do not share it with anyone.</p>
            </div>
            <p style=""font-size: 0.85rem; color: #64748B; margin-top: 32px; border-top: 1px solid #1E293B; padding-top: 24px;"">
                For privacy, this email only includes verification summaries, not private notes or sealed letter contents.
            </p>
        </div>";

        await SendEmailAsync(destination, subject, plainText, html, cancellationToken);
    }

    public async Task SendEmailAsync(string toEmail, string subject, string plainTextBody, string htmlBody, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ResendApiKey))
        {
            _logger.LogWarning("Resend provider called, but ResendApiKey is missing. Cannot send email.");
            return;
        }

        try
        {
            using var client = _httpClientFactory.CreateClient("ResendClient");
            client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _options.ResendApiKey);
            client.DefaultRequestHeaders.Add("User-Agent", "Arova/1.0");

            var payload = new ResendPayload
            {
                From = $"{_options.FromName} <{_options.FromEmail}>",
                To = new[] { toEmail },
                Subject = subject,
                Text = plainTextBody,
                Html = htmlBody
            };

            var response = await client.PostAsJsonAsync("https://api.resend.com/emails", payload, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("Failed to send email via Resend API. Status: {StatusCode}, Error: {Error}", response.StatusCode, errorContent);
            }
            else
            {
                _logger.LogInformation("Successfully sent email to {ToEmail} via Resend API", toEmail);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending email via Resend API to {ToEmail}", toEmail);
        }
    }

    private sealed class ResendPayload
    {
        [JsonPropertyName("from")]
        public string From { get; set; } = string.Empty;

        [JsonPropertyName("to")]
        public string[] To { get; set; } = Array.Empty<string>();

        [JsonPropertyName("subject")]
        public string Subject { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("html")]
        public string Html { get; set; } = string.Empty;
    }
}
