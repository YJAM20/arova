# Arova Backend QA — Manual API Test Steps

> This document provides step-by-step manual QA for the Arova ASP.NET Core backend.
> All tests assume local development with `http://localhost:5036`.

## Prerequisites

```powershell
cd C:\Users\yajm2\source\repos\OurLittleUniverse\OurLittleUniverse
dotnet build
dotnet run
```

---

## 1. Build Backend

```powershell
dotnet build
```

- [ ] Build succeeds with 0 errors and 0 warnings.

## 2. Run Backend

```powershell
dotnet run
```

- [ ] Server starts and listens on `http://localhost:5036`.
- [ ] Console shows `Now listening on: http://localhost:5036`.

## 3. Check /api/health

```http
GET http://localhost:5036/api/health
```

- [ ] Returns 200 OK.
- [ ] Response includes `status: "Healthy"` or equivalent.
- [ ] Response includes app name `Arova API` or `Arova API (Development)`.
- [ ] No passwords, hashes, or secrets in the response.

## 4. Open Swagger

```text
http://localhost:5036/swagger
```

- [ ] Swagger UI loads.
- [ ] Title shows "Arova API".
- [ ] Description shows "Arova - A private space for two."
- [ ] Bearer JWT authorization button is available.
- [ ] No password hashes, verification code hashes, or secrets visible in schemas.

## 5. Register User (Owner)

```http
POST /api/auth/register
Content-Type: application/json

{
  "displayName": "Demo Owner",
  "username": "owner",
  "email": "demo@example.com",
  "password": "owner-pass-1234"
}
```

- [ ] Returns 200 OK with `AuthResponse`.
- [ ] Response contains `token`, `user`, `isVerified`, `hasCompletedQuickOnboarding`, `hasCompletedProfile`, `hasCouple`, `preferredLanguage`, `canEnableMatureMode`, `matureContentEnabled`.
- [ ] `user` does NOT contain `passwordHash`.
- [ ] `isVerified` is `false` (not yet verified).

## 6. Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "demo@example.com",
  "password": "owner-pass-1234"
}
```

- [ ] Returns 200 OK with `AuthResponse`.
- [ ] Token is a valid JWT.
- [ ] Save the token as `OWNER_TOKEN` for subsequent requests.

## 7. Call /api/auth/me

```http
GET /api/auth/me
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns 200 OK with `UserResponse`.
- [ ] Contains `id`, `displayName`, `username`, `email`, `isVerified`, `createdAt`.
- [ ] Does NOT contain `passwordHash`.

## 8. Test Password Strength

```http
POST /api/auth/password-strength
Content-Type: application/json

{
  "password": "password123"
}
```

- [ ] Returns 200 OK with `score`, `label`, `feedback`.
- [ ] Score is low for common passwords (e.g. `"password"` → score 0).
- [ ] Score is higher for strong passphrases.
- [ ] Backend console does NOT log the password.

```http
POST /api/auth/password-strength
Content-Type: application/json

{
  "password": "a very strong unique passphrase 2026"
}
```

- [ ] Returns score 3 or 4, label "Good" or "Strong".

## 9. Request Email Verification Code

```http
POST /api/auth/request-verification-code
Content-Type: application/json

{
  "channel": "Email",
  "destination": "demo@example.com",
  "purpose": "EmailConfirmation"
}
```

- [ ] Returns 200 OK with `succeeded: true`.
- [ ] Message says something like "If the destination can receive verification codes, a code has been sent."
- [ ] Response does NOT return the plain code.

## 10. Read Code from Backend Console

- [ ] Check the backend terminal output.
- [ ] Should show: `Development email verification code for demo@example.com and purpose EmailConfirmation: XXXXXX`
- [ ] Save the 6-digit code.

## 11. Verify Email

```http
POST /api/auth/verify-code
Content-Type: application/json

{
  "channel": "Email",
  "destination": "demo@example.com",
  "code": "XXXXXX",
  "purpose": "EmailConfirmation"
}
```

- [ ] Returns 200 OK with `succeeded: true`, message `"Verification completed."`.
- [ ] Login again and confirm `isVerified` is now `true`.

## 12. Create Couple

```http
POST /api/couples
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "name": "Our Space"
}
```

- [ ] Returns 200 OK with `CoupleResponse`.
- [ ] `currentUserRole` is `"Owner"`.
- [ ] `memberCount` is `1`.

## 13. Generate Pairing Code

```http
POST /api/couples/pairing-code
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns 200 OK with `code` (6 uppercase letters) and `expiresAtUtc`.
- [ ] `expiresAtUtc` is approximately 30 minutes from now.
- [ ] Save the code.

## 14. Register and Login Second User (Partner)

```http
POST /api/auth/register
Content-Type: application/json

{
  "displayName": "Demo Partner",
  "username": "partner",
  "email": "partner@example.com",
  "password": "partner-pass-1234"
}
```

- [ ] Returns 200 OK.
- [ ] Login as partner and save `PARTNER_TOKEN`.

## 15. Join with Code

```http
POST /api/couples/join
Authorization: Bearer {PARTNER_TOKEN}
Content-Type: application/json

{
  "code": "XXXXXX"
}
```

- [ ] Returns 200 OK with `CoupleResponse`.
- [ ] `currentUserRole` is `"Partner"`.
- [ ] `memberCount` is `2`.

### 15a. Test Invalid/Expired/Used Code

```http
POST /api/couples/join
Authorization: Bearer {PARTNER_TOKEN}
Content-Type: application/json

{
  "code": "ZZZZZZ"
}
```

- [ ] Returns 404 "Pairing code was not found." or 400 "This pairing code has already been used."

## 16. Test Plans

```http
GET /api/plans
```

- [ ] Returns 200 OK with 3 plans: Free, Pro, Platinum.
- [ ] No real payment fields, no card fields, no Stripe/PayPal references.
- [ ] Endpoint is public (no auth required).

## 17. Test Gifted Upgrade

```http
POST /api/plans/gifted-upgrade
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "planType": "Pro"
}
```

- [ ] Returns 200 OK with `message` and `subscription`.
- [ ] `subscription.isGifted` is `true`.
- [ ] `subscription.status` is `"GiftedAccess"`.
- [ ] `subscription.planType` is `"Pro"`.

## 18. Test Onboarding Questions

```http
GET /api/onboarding/questions
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns list of questions.
- [ ] Questions include `textEn`, `textAr`, `textEs`.
- [ ] Quick start questions: 7 (where `isQuickStart` is `true`).
- [ ] Deep personalization questions exist (where `isQuickStart` is `false`).
- [ ] No medical, therapy, or diagnostic questions.
- [ ] No explicit or sensitive content for minors.

## 19. Submit Onboarding Answers

```http
POST /api/onboarding/answers
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "answers": [
    { "questionKey": "display_name", "answerValue": "Demo" },
    { "questionKey": "preferred_language", "answerValue": "en" }
  ]
}
```

- [ ] Returns 200 OK with list of answers.
- [ ] Answers are scoped to current user only.

## 20. Create/Update Profile

```http
PUT /api/profile/me
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "displayName": "Demo Owner",
  "preferredLanguage": "en",
  "dateOfBirth": "1990-06-15T00:00:00Z"
}
```

- [ ] Returns 200 OK with `UserProfileResponse`.
- [ ] `preferredLanguage` is `"en"`.
- [ ] `matureContentEnabled` is `false` by default.

```http
GET /api/profile/me
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns the saved profile.

## 21. Test Content Safety — Under 18

```http
PUT /api/profile/me
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "displayName": "Demo Owner",
  "preferredLanguage": "en",
  "dateOfBirth": "2015-01-01T00:00:00Z"
}
```

```http
GET /api/profile/content-safety
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] `canEnableMatureMode` is `false`.
- [ ] Reason mentions under 18 or age not confirmed.

```http
PUT /api/profile/mature-content
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "matureContentEnabled": true
}
```

- [ ] Returns 403 Forbidden because the user is under 18.

## 22. Test Content Safety — 18+ with Partner Requirement

```http
PUT /api/profile/me
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "displayName": "Demo Owner",
  "preferredLanguage": "en",
  "dateOfBirth": "1990-06-15T00:00:00Z"
}
```

```http
GET /api/profile/content-safety
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] If partner has no DOB or is under 18: `canEnableMatureMode` is `false`.
- [ ] If both partners are 18+ with confirmed DOB: `canEnableMatureMode` is `true`.

## 23. Test Content Couple Scoping (Memories/Reasons/Letters)

### Memories

```http
POST /api/memories
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "Our first day",
  "description": "A beautiful start",
  "visibilityLevel": "Shared"
}
```

- [ ] Returns 200 OK with `MemoryResponse`.

```http
GET /api/memories
Authorization: Bearer {PARTNER_TOKEN}
```

- [ ] Partner can see the memory (same couple).

### Reasons

```http
POST /api/reasons
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "text": "Your smile",
  "visibilityLevel": "Shared"
}
```

- [ ] Returns 200 OK.

### Letters

```http
POST /api/letters
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "First letter",
  "body": "Hello from Arova",
  "visibilityLevel": "Shared"
}
```

- [ ] Returns 200 OK.

### Cross-Couple Scoping

- [ ] A third user NOT in this couple should get 404/403 when trying to access these endpoints.
- [ ] Users without a couple get "Create or join a couple space first."

## 24. Test Chat Messages

```http
POST /api/chat/messages
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "message": "Hello from owner!",
  "messageType": "Text"
}
```

- [ ] Returns 200 OK with `ChatMessageResponse`.
- [ ] `userDisplayName` is present.

```http
GET /api/chat/messages
Authorization: Bearer {PARTNER_TOKEN}
```

- [ ] Partner can see the owner's message.
- [ ] Messages are couple-scoped only.

### Null/Empty Message

```http
POST /api/chat/messages
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "message": "",
  "messageType": "Text"
}
```

- [ ] Returns 400 "Message is required."

## 25. Test SignalR (Optional)

Connect to `/hubs/couple?access_token={OWNER_TOKEN}` using a SignalR test client.

- [ ] Connection succeeds.
- [ ] User joins the group `couple-{coupleId}`.
- [ ] Calling `SendMessage("Hello")` triggers `ReceiveMessage` event on both connected clients.
- [ ] No messages leak to other couples.

## 26. Test Backup Export/Import

### Export

```http
GET /api/backup/export
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns 200 OK with `BackupExportResponse`.
- [ ] Contains `memories`, `reasons`, `letters`, `moodEntries`, `songs`, `challenges`, `futurePlans`, `chatMessages`, `settings`.
- [ ] No password hashes, verification codes, or tokens in export.
- [ ] Data is scoped to the current couple only.

### Import

```http
POST /api/backup/import
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "memories": [
    { "title": "Imported memory", "visibilityLevel": "Shared" }
  ]
}
```

- [ ] Returns 200 OK with success message.

### Partner Import with Settings

```http
POST /api/backup/import
Authorization: Bearer {PARTNER_TOKEN}
Content-Type: application/json

{
  "memories": [
    { "title": "Partner imported memory", "visibilityLevel": "Shared" }
  ],
  "settings": {
    "timeZone": "UTC",
    "dailyReasonsEnabled": true,
    "moodTrackingEnabled": true,
    "privateByDefault": false,
    "activeTheme": "default",
    "languageMode": "en",
    "animationsEnabled": true,
    "musicEnabled": true
  }
}
```

- [ ] Returns 200 OK.
- [ ] Message includes: "Settings were skipped because only the owner can import couple settings."
- [ ] Content (memories) is imported.
- [ ] Settings are NOT changed by the partner.

## 27. Confirm Phone Verification Unavailable

```http
POST /api/auth/request-verification-code
Content-Type: application/json

{
  "channel": "Phone",
  "destination": "+1234567890",
  "purpose": "PhoneConfirmation"
}
```

- [ ] Returns 200 OK with `succeeded: false`.
- [ ] Message: "Phone verification is not available in this environment yet. Please use email verification for now."

```http
POST /api/auth/verify-code
Content-Type: application/json

{
  "channel": "Phone",
  "destination": "+1234567890",
  "code": "123456",
  "purpose": "PhoneConfirmation"
}
```

- [ ] Returns 200 OK with `succeeded: false`.
- [ ] Same phone unavailable message.

## 28. Confirm Google/Apple Provider Not Configured

```http
POST /api/auth/external-login
Content-Type: application/json

{
  "provider": "Google",
  "idToken": "fake-token"
}
```

- [ ] Returns 200 OK with `succeeded: false`.
- [ ] Message: "External login provider is not configured in this environment."

```http
POST /api/auth/external-login
Content-Type: application/json

{
  "provider": "Apple",
  "idToken": "fake-token"
}
```

- [ ] Same result for Apple.

## 29. Confirm No True E2EE Claim

- [ ] Chat messages include `encryptionMode: "None"` by default.
- [ ] No endpoint, DTO, or doc claims "end-to-end encrypted".
- [ ] CHAT_SECURITY_NOTES.md says: "Secure couple-scoped chat with encryption-ready fields."
- [ ] E2EE is listed as future roadmap only.

## 30. Confirm No Private Data or Secrets

- [ ] No real names (Yaman, Haneen) in source code or docs.
- [ ] No real emails, phone numbers, or personal romantic messages.
- [ ] No Google Client IDs, Apple Keys, SMS API keys, or SMTP passwords in source.
- [ ] JWT secret in `appsettings.Development.json` says "development-only-secret-key-change-before-production".
- [ ] No hardcoded secrets in `appsettings.json`.

---

## Additional Endpoint Checks

### Settings

```http
GET /api/settings
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns 200 OK with `CoupleSettingsResponse`.

```http
PUT /api/settings
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "timeZone": "America/New_York",
  "dailyReasonsEnabled": true,
  "moodTrackingEnabled": true,
  "privateByDefault": false,
  "activeTheme": "dark",
  "languageMode": "en",
  "animationsEnabled": true,
  "musicEnabled": true
}
```

- [ ] Returns 200 OK.

### Challenges

```http
POST /api/challenges
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "30-day kindness challenge"
}
```

- [ ] Returns 200 OK.

### Future Plans

```http
POST /api/future-plans
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "Trip to the mountains",
  "visibilityLevel": "Shared"
}
```

- [ ] Returns 200 OK.

### Songs

```http
POST /api/songs
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "Our Song",
  "artist": "Demo Artist",
  "visibilityLevel": "Shared"
}
```

- [ ] Returns 200 OK.

### Moods

```http
POST /api/moods
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "moodValue": 8,
  "note": "Feeling great today"
}
```

- [ ] Returns 200 OK.

### Feedback

```http
POST /api/feedback
Content-Type: application/json

{
  "rating": 5,
  "message": "Great app concept"
}
```

- [ ] Returns 200 OK.
- [ ] Message: "Thanks for helping Arova grow."

### Setup Status

```http
GET /api/setup/status
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns 200 OK with all setup flags.
- [ ] No null reference errors even if profile/couple/subscription is missing.

### Couple Members

```http
GET /api/couples/members
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns list of active members with `displayName`, `username`, `role`, `joinedAt`.
- [ ] No `passwordHash` or sensitive fields.

### Subscription

```http
GET /api/couples/subscription
Authorization: Bearer {OWNER_TOKEN}
```

- [ ] Returns current subscription details.
- [ ] Defaults to Free if none existed.

---

## 31. Planets System

### Get All Planets
```http
GET /api/planets
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns list of 10 seeded planets.
- [ ] Ordered by `sortOrder`.

### Today's Planet (Initially Null)
```http
GET /api/planets/today
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns 200 OK with null (no planet assigned yet).

### Roll Today's Planet
```http
POST /api/planets/today/roll
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns 200 OK with the rolled planet and empty task completions.
- [ ] Rolling again on the same day returns the same planet.

### Complete Planet Task
```http
POST /api/planets/tasks/complete
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "taskKey": "mercury_task_1"
}
```
- [ ] Returns 200 OK with updated planet completions.
- [ ] Adds points to the relationship score ledger.
- [ ] Subsequent completion attempt of the same task returns 400 Bad Request.

---

## 32. Relationship Score & Daily Tasks

### Get Score & Ranks
```http
GET /api/relationship-score
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns total points, current rank, and progress to next rank.

### Get Daily Tasks (Seeds 5 tasks)
```http
GET /api/relationship-score/daily-tasks
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns 5 deterministic daily tasks.

### Complete Daily Task
```http
POST /api/relationship-score/daily-tasks/{taskId}/complete
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns 200 OK with updated daily task completion flag.
- [ ] Adds points to the score ledger.

### Get Point Ledger
```http
GET /api/relationship-score/ledger
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns last 50 point entries, including planet and daily task points.

---

## 33. Custom Sections with Plan Limits

### Create Section (Free Limit)
```http
POST /api/custom-sections
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "Bucket List",
  "description": "Places to visit together",
  "icon": "heart",
  "visibilityLevel": 1
}
```
- [ ] Returns 201 Created with the section details.

### Create Second Section (Triggers Plan Limit)
```http
POST /api/custom-sections
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "title": "Movies to Watch"
}
```
- [ ] Returns 403 Forbidden with "You have reached the limit for your current plan." message.

### Add Checklist Item
```http
POST /api/custom-sections/{sectionId}/items
Authorization: Bearer {OWNER_TOKEN}
Content-Type: application/json

{
  "text": "Visit Paris",
  "sortOrder": 1
}
```
- [ ] Returns 201 Created with item details.

---

## 34. Admin Dashboard Security

### Get Admin Overview (Non-Admin User)
```http
GET /api/admin/overview
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns 403 Forbidden since `IsSystemAdmin` is false.

---

## 35. Profile Stats

### Get Profile Stats
```http
GET /api/profile/stats
Authorization: Bearer {OWNER_TOKEN}
```
- [ ] Returns aggregated counts for memories, letters, reasons, planet completions, chat messages, and score rank.

---

## QA Summary Checklist

| # | Area | Status |
|---|------|--------|
| 1 | Build | ✅ |
| 2 | Runtime | Manual |
| 3 | Health | Manual |
| 4 | Swagger | Manual |
| 5 | Register | Manual |
| 6 | Login | Manual |
| 7 | /api/auth/me | Manual |
| 8 | Password strength | Manual |
| 9 | Email verification request | Manual |
| 10 | Console code output | Manual |
| 11 | Email verify | Manual |
| 12 | Create couple | Manual |
| 13 | Pairing code | Manual |
| 14 | Second user | Manual |
| 15 | Join couple | Manual |
| 16 | Plans | Manual |
| 17 | Gifted upgrade | Manual |
| 18 | Onboarding questions | Manual |
| 19 | Submit answers | Manual |
| 20 | Profile | Manual |
| 21 | Under-18 safety | Manual |
| 22 | 18+ partner check | Manual |
| 23 | Content scoping | Manual |
| 24 | Chat messages | Manual |
| 25 | SignalR | Manual |
| 26 | Backup export/import | Manual |
| 27 | Phone unavailable | Manual |
| 28 | External auth unavailable | Manual |
| 29 | No E2EE claim | Manual |
| 30 | No private data/secrets | Manual |
| 31 | Planets System | Manual |
| 32 | Relationship Score | Manual |
| 33 | Custom Sections | Manual |
| 34 | Admin Dashboard | Manual |
| 35 | Profile Stats | Manual |


