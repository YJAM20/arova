# Arova API Endpoints

## Health

- `GET /api/health`

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/password-strength`
- `POST /api/auth/request-verification-code`
- `POST /api/auth/verify-code`
- `POST /api/auth/external-login`

## Plans

- `GET /api/plans`
- `POST /api/plans/gifted-upgrade`
- `GET /api/couples/subscription`
- `PUT /api/couples/subscription`

## Couples

- `POST /api/couples`
- `GET /api/couples/my`
- `POST /api/couples/pairing-code`
- `POST /api/couples/join`
- `GET /api/couples/members`

## Profile, Setup, And Onboarding

- `GET /api/profile/me`
- `PUT /api/profile/me`
- `GET /api/profile/content-safety`
- `PUT /api/profile/mature-content`
- `GET /api/profile/stats`
- `GET /api/setup/status`
- `GET /api/onboarding/questions`
- `GET /api/onboarding/my-answers`
- `POST /api/onboarding/answers`

## Memories

- `GET /api/memories`
- `GET /api/memories/{id}`
- `POST /api/memories`
- `PUT /api/memories/{id}`
- `DELETE /api/memories/{id}`

## Reasons

- `GET /api/reasons`
- `GET /api/reasons/daily`
- `GET /api/reasons/random`
- `GET /api/reasons/{id}`
- `POST /api/reasons`
- `PUT /api/reasons/{id}`
- `DELETE /api/reasons/{id}`
- `POST /api/reasons/{id}/reactions`
- `DELETE /api/reasons/{id}/reactions/{type}`

## Letters

- `GET /api/letters`
- `GET /api/letters/{id}`
- `POST /api/letters`
- `PUT /api/letters/{id}`
- `DELETE /api/letters/{id}`

## Moods

- `GET /api/moods`
- `GET /api/moods/today`
- `POST /api/moods`
- `POST /api/moods/{id}/response`

## Songs

- `GET /api/songs`
- `POST /api/songs`
- `PUT /api/songs/{id}`
- `DELETE /api/songs/{id}`
- `POST /api/songs/{id}/favorite`

## Settings

- `GET /api/settings`
- `PUT /api/settings`

## Challenges

- `GET /api/challenges`
- `GET /api/challenges/daily`
- `POST /api/challenges`
- `PUT /api/challenges/{id}`
- `DELETE /api/challenges/{id}`
- `POST /api/challenges/{id}/complete`

## Future Plans

- `GET /api/future-plans`
- `GET /api/future-plans/{id}`
- `POST /api/future-plans`
- `PUT /api/future-plans/{id}`
- `DELETE /api/future-plans/{id}`
- `POST /api/future-plans/{id}/mark-done`

## Chat

- `GET /api/chat/messages`
- `POST /api/chat/messages`

## SignalR

- Hub endpoint: `/hubs/couple`
- Client method: `SendMessage`
- Server event: `ReceiveMessage`
- Browser clients can pass JWTs with `access_token` during the hub connection.

## Backup

- `GET /api/backup/export`
- `POST /api/backup/import`

## Feedback

- `POST /api/feedback`

## Planets

- `GET /api/planets`
- `GET /api/planets/today`
- `POST /api/planets/today/roll`
- `POST /api/planets/tasks/complete`

## Relationship Score

- `GET /api/relationship-score`
- `GET /api/relationship-score/ledger`
- `GET /api/relationship-score/daily-tasks`
- `POST /api/relationship-score/daily-tasks/{id}/complete`

## Custom Sections

- `GET /api/custom-sections`
- `POST /api/custom-sections`
- `PUT /api/custom-sections/{id}`
- `DELETE /api/custom-sections/{id}`
- `POST /api/custom-sections/{id}/items`
- `PUT /api/custom-sections/{sectionId}/items/{itemId}`
- `DELETE /api/custom-sections/{sectionId}/items/{itemId}`

## Admin

- `GET /api/admin/overview`
- `GET /api/admin/feedback`
- `GET /api/admin/health`
