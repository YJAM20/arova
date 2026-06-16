# Arova

Arova - A private space for two.

A quiet place for everything you share.

Arova helps two people stay close through memories, letters, moods, questions, plans, and private conversations - all in one shared space.

This repository contains the ASP.NET Core backend for API Mode. A future frontend can also support Local Mode for device-local use.

## Portfolio Version

The current backend is configured for a public GitHub portfolio version:

- SQLite local development.
- JWT auth.
- Email verification code logging in development.
- Phone verification placeholder.
- Google/Apple login placeholders.
- Gifted paid-plan access without payment processing.
- No production secrets.

## Future Product Version

The same codebase can later use the `ProductProfile` configuration to enable real providers for production email, SMS, external auth, storage, and payments.

No real payment processor, SMS provider, or external auth credential is included here.
