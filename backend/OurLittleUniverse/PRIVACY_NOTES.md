# Arova Privacy Notes

Arova is designed as a privacy-first shared space for two people.

## Current Protections

- JWT-protected API endpoints.
- Couple-scoped data access.
- DTO-only responses.
- Password hashes are stored, not plain passwords.
- Verification code hashes are stored, not plain verification codes.
- Letter passcode hashes are not exported in backups.
- Backup export is scoped to the current couple.

## Portfolio Limitations

- SQLite is for local development.
- Email verification logs codes locally in Development.
- Phone verification is unavailable.
- External login providers are placeholders.
- Chat is secure and couple-scoped, but not true end-to-end encrypted yet.

## Production Requirements Later

- Production-grade secret management.
- Real email and SMS providers.
- Strong rate limiting and abuse protection.
- Client-side encryption design before marketing E2EE.
- Production storage for media.
