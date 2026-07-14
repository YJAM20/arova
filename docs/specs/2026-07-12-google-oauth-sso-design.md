# Design Spec: Google OAuth SSO Integration

**Date**: 2026-07-12  
**Author**: Antigravity  
**Status**: Approved (User approved the conceptual design and delegated full implementation details)

---

## 1. Goal Description

This design details the implementation of secure **Google OAuth SSO Integration** in the backend. We will transition the current static placeholder `GoogleExternalAuthVerifier` into a cryptographic verifier that fetches Google's JSON Web Keys (JWKs) and validates ID Tokens locally.

---

## 2. Configuration Design

In `appsettings.json`, we will add the configuration settings under the `"Authentication"` section:

```json
{
  "Authentication": {
    "GoogleClientId": "your-google-client-id.apps.googleusercontent.com"
  }
}
```

---

## 3. Implementation Design

We will use the official Google API library `Google.Apis.Auth` to perform secure JWT validation locally.

### Token Verification Flow
1. Fetch configurations: Get `GoogleClientId` from options.
2. If `GoogleClientId` is not configured, warn in the logs and return a failure indicating the missing configuration.
3. Validate: Call `GoogleJsonWebSignature.ValidateAsync(idToken, settings)` where `settings.Audience` contains the `GoogleClientId`.
4. If valid: Return `Succeeded = true` and include the verified email and name in the response message.
5. If invalid (expired, bad signature, incorrect audience): Catch `InvalidJwtException` and return `Succeeded = false` with the validation error details.

---

## 4. Proposed Changes

### Backend: OurLittleUniverse

#### [MODIFY] [OurLittleUniverse.csproj](file:///c:/Dev/Arova/backend/OurLittleUniverse/OurLittleUniverse.csproj)
- Add reference to NuGet package `Google.Apis.Auth` version `1.68.0`.

#### [NEW] [GoogleAuthOptions.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Options/GoogleAuthOptions.cs)
Strongly typed options model:
```csharp
namespace LoveUniverse.Api.Options;

public sealed class GoogleAuthOptions
{
    public string GoogleClientId { get; set; } = string.Empty;
}
```

#### [MODIFY] [GoogleExternalAuthVerifier.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Services/GoogleExternalAuthVerifier.cs)
- Refactor the stub method to perform real token verification using `GoogleJsonWebSignature`:
```csharp
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
            _logger.LogInformation("Successfully verified Google ID token for subject: {Subject}", payload.Subject);
            
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
```

#### [MODIFY] [Program.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Program.cs)
- Bind the `"Authentication"` config section to `GoogleAuthOptions`.

#### [MODIFY] [appsettings.json](file:///c:/Dev/Arova/backend/OurLittleUniverse/appsettings.json) and [appsettings.Development.json](file:///c:/Dev/Arova/backend/OurLittleUniverse/appsettings.Development.json)
- Add the `"Authentication"` config block.

---

## 5. Verification Plan

### Automated Verification
- Run `dotnet build` to ensure the project compiles with no errors.
- Run `dotnet test` to verify no unit tests are broken.
