using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;

namespace LoveUniverse.Api.Services.Sms;

public sealed class TwilioSmsSender : ISmsSender
{
    private readonly HttpClient _httpClient;
    private readonly SmsOptions _options;
    private readonly ILogger<TwilioSmsSender> _logger;

    public TwilioSmsSender(
        HttpClient httpClient,
        IOptions<SmsOptions> options,
        ILogger<TwilioSmsSender> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;
    }

    private static string MaskPhoneNumber(string? phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber)) return string.Empty;
        return phoneNumber.Length > 4
            ? new string('*', phoneNumber.Length - 4) + phoneNumber[^4..]
            : phoneNumber;
    }

    public async Task<SmsSendResult> SendVerificationCodeAsync(
        string destination,
        string code,
        string purpose,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.TwilioAccountSid) ||
            string.IsNullOrWhiteSpace(_options.TwilioAuthToken) ||
            string.IsNullOrWhiteSpace(_options.TwilioFromNumber))
        {
            _logger.LogWarning("Twilio provider called, but configurations are missing. Cannot send SMS.");
            return new SmsSendResult(false, "Twilio configuration credentials are missing.");
        }

        var maskedDestination = MaskPhoneNumber(destination);
        var messageBody = string.IsNullOrWhiteSpace(code)
            ? $"Arova verification update for: {purpose}."
            : $"Your Arova verification code is: {code}\n\nThis code is for {purpose} and will expire in 10 minutes.";

        try
        {
            var url = $"https://api.twilio.com/2010-04-01/Accounts/{_options.TwilioAccountSid}/Messages.json";
            var request = new HttpRequestMessage(HttpMethod.Post, url);

            // Basic Auth
            var authHeaderValue = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_options.TwilioAccountSid}:{_options.TwilioAuthToken}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authHeaderValue);

            // POST Form URL-encoded data
            var keyValues = new List<KeyValuePair<string, string>>
            {
                new("To", destination),
                new("From", _options.TwilioFromNumber),
                new("Body", messageBody)
            };
            request.Content = new FormUrlEncodedContent(keyValues);

            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Successfully sent SMS to '{Destination}' for purpose '{Purpose}' via Twilio API.", maskedDestination, purpose);
                return new SmsSendResult(true, "SMS sent successfully via Twilio.");
            }

            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Failed to send SMS to '{Destination}' via Twilio API. Status: {StatusCode}, Error: {Error}", maskedDestination, response.StatusCode, errorContent);
            return new SmsSendResult(false, $"Twilio returned error status {response.StatusCode}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending SMS to '{Destination}' via Twilio for purpose '{Purpose}'", maskedDestination, purpose);
            return new SmsSendResult(false, "An error occurred while sending the SMS.");
        }
    }
}
