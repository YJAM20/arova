# Design Spec: Twilio SMS Adapter Integration

**Date**: 2026-07-12  
**Author**: Antigravity  
**Status**: Approved (User approved the conceptual design and delegated full implementation details)

---

## 1. Goal Description

This design details the implementation of a configuration-driven **Twilio SMS Adapter** to send verification codes to users. By default, Arova will log verification codes to the console to ensure zero-setup local runs. When configured with valid Twilio credentials, it will dynamically boot the `TwilioSmsSender` to deliver real SMS messages.

---

## 2. Configuration Design

In `appsettings.json`, we will add the following configuration settings under the `"Sms"` section:

```json
{
  "Sms": {
    "Provider": "Console", // Options: "Console" or "Twilio"
    "TwilioAccountSid": "",
    "TwilioAuthToken": "",
    "TwilioFromNumber": ""
  }
}
```

---

## 3. Class Design

### TwilioSmsSender

A clean, dependency-free `ISmsSender` implementation using the system's `HttpClient` to communicate with Twilio.

- **Class name**: `TwilioSmsSender`
- **Namespace**: `LoveUniverse.Api.Services`
- **Dependencies**: `HttpClient`, `IOptions<SmsOptions>`, `ILogger<TwilioSmsSender>`
- **HTTP Request Details**:
  - **URL**: `https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages.json`
  - **Method**: `POST`
  - **Authentication**: Basic Authentication using `AccountSid` as username and `AuthToken` as password.
  - **Content-Type**: `application/x-www-form-urlencoded`
  - **Parameters**:
    - `To`: Destination phone number.
    - `From`: Twilio outgoing phone number.
    - `Body`: SMS message content.

---

## 4. Proposed Changes

### Backend: OurLittleUniverse

#### [NEW] [SmsOptions.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Services/Sms/SmsOptions.cs)
Strongly typed options to bind app configuration:
```csharp
namespace LoveUniverse.Api.Services.Sms;

public sealed class SmsOptions
{
    public string Provider { get; set; } = "Console";
    public string TwilioAccountSid { get; set; } = string.Empty;
    public string TwilioAuthToken { get; set; } = string.Empty;
    public string TwilioFromNumber { get; set; } = string.Empty;
}
```

#### [NEW] [TwilioSmsSender.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Services/Sms/TwilioSmsSender.cs)
Sends real SMS messages calling Twilio endpoint via direct HTTP Client:
```csharp
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
                _logger.LogInformation("Successfully sent SMS for purpose '{Purpose}' via Twilio API.", purpose);
                return new SmsSendResult(true, "SMS sent successfully via Twilio.");
            }

            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Failed to send SMS via Twilio API. Status: {StatusCode}, Error: {Error}", response.StatusCode, errorContent);
            return new SmsSendResult(false, $"Twilio returned error status {response.StatusCode}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while sending SMS via Twilio for purpose '{Purpose}'", purpose);
            return new SmsSendResult(false, "An error occurred while sending the SMS.");
        }
    }
}
```

#### [MODIFY] [Program.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Program.cs)
- Register `SmsOptions` configuration section.
- Register `TwilioSmsSender` and dynamic `ISmsSender` instantiation with fallback.

---

## 5. Verification Plan

### Automated Verification
- Run `dotnet build` to ensure the project builds with no compilation errors.
- Run `dotnet test` to verify no unit tests are broken.

### Manual Verification
- Configure `appsettings.json` with dummy values for Twilio provider. Check logger prints warning or returns expected Twilio auth error code, demonstrating the path works.
