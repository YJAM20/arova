# Auth And Onboarding Flow

## Auth

1. `POST /api/auth/register`
2. `POST /api/auth/request-verification-code`
3. Read the local development email code from the console/log.
4. `POST /api/auth/verify-code`
5. `POST /api/auth/login`
6. Use the returned JWT in Swagger or the frontend.

Phone verification returns:

```text
Phone verification is not available in this environment yet. Please use email verification for now.
```

Google and Apple login return:

```text
External login provider is not configured in this environment.
```

## Onboarding

Quick onboarding includes seven required or semi-required setup questions. Deep personalization includes optional questions for identity, relationship, communication, preferences, privacy, future plans, and boundaries.

Endpoints:

- `GET /api/onboarding/questions`
- `GET /api/onboarding/my-answers`
- `POST /api/onboarding/answers`
- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/setup/status`

## Setup Status

`GET /api/setup/status` reports verification, quick onboarding, profile completion, couple membership, subscription presence, language, and mature content safety flags.
