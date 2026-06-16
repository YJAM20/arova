# Arova Backend Release Notes — v1.0.0-preview.1

This release documents the current preview version of the Arova backend, summarizing the implemented features, validation instructions, security measures, and development limits.

---

## 1. Implemented Backend Modules

The backend fully supports all features configured for the Arova product:

1.  **Authentication & Verification**: Login, register, email validation code simulation, and password strength requirements check.
2.  **Couple Pairing**: Create couple spaces, generate deterministic invitation/pairing codes, join existing couple spaces, and query couple membership.
3.  **Memories Feed**: Create, view, update, and delete shared memories.
4.  **Reasons (Appreciation)**: Daily quotes, reaction mapping, random reason generator.
5.  **Letters (Time Capsule)**: Encapsulate letters, lock/unlock timer validations.
6.  **Mood Check-in**: Record current emotional state, view partner's mood history.
7.  **Shared Songs**: Add and curate common favorite tracks.
8.  **Couple Settings**: Scoped settings configuration (e.g. mature content filters).
9.  **Challenges & Future Plans**: Curate mutual checklists and milestone goals.
10. **SignalR Chat & Real-Time Sync**: Instant couple communication with automated broadcasting to SignalR couple groups.
11. **Planets Progression Map (The Orbit Page)**: 10-planet progress map supporting daily rolls, task completions, and point rewards.
12. **Relationship Score & Daily Tasks**: Gamified point tracking, scoring ledger history, deterministic daily tasks checklists, and title ranks progression.
13. **Custom Sections**: Plan-scoped custom bucket lists and checklists.
14. **System Administration Dashboard**: Admin-only overview stats, feedback listing, and database status diagnosis.
15. **Backup & Restore**: Export and import complete couple states safely across users.

---

## 2. API Readiness

*   **Host URL**: `http://localhost:5036`
*   **Documentation UI**: Swagger UI is available at `http://localhost:5036/swagger` in development environment.
*   **Health Status**: `/api/health` displays real-time diagnostic indicators for service and database status.
*   **Migrations**: 8 database migrations have been successfully created and checked. Running `dotnet ef database update` applies the schema to your local SQLite file.

---

## 3. Security Notes

*   **Passwords**: Safely hashed using **PBKDF2** cryptography; plaintext passwords are never stored or returned in response DTOs.
*   **Verification Codes**: Stored as salted hashes in the database.
*   **Couple Scoping**: Every API service verifies user credentials and checks that the user has a valid, active membership in the target couple before retrieving or modifying records, blocking unauthorized cross-couple queries.
*   **JWT Integrity**: Bearer token configurations use standard cryptographic signing.
*   **E2EE Ready**: The database and API schemas include fields for payload nonces, key IDs, and encryption modes to prepare the codebase for future client-side end-to-end encryption.

---

## 4. Current Limitations

*   **No live external providers**: SMS sending, payment upgrading, Google login, and Apple login use development-only mock placeholders that return structured errors or output logs to the console rather than utilizing active keys.
*   **Development Keys**: The default configuration files contain a public JWT signing key for convenience during local testing. A production key must be injected via environment variables.

---

## 5. How to Run & Validate

### Running Locally
1.  Copy template configuration: `cp OurLittleUniverse/appsettings.example.json OurLittleUniverse/appsettings.Development.json`
2.  Restore packages: `dotnet restore`
3.  Build solution: `dotnet build`
4.  Update database: `dotnet ef database update --project OurLittleUniverse`
5.  Start server: `dotnet run --project OurLittleUniverse`

### Validation Steps
*   Open `http://localhost:5036/swagger` in your browser.
*   Execute the manual testing steps defined in **[QA_BACKEND_API.md](file:///C:/Users/yajm2/source/repos/OurLittleUniverse/OurLittleUniverse/QA_BACKEND_API.md)**.
*   The Angular frontend can be configured to connect directly to the backend API at `http://localhost:5036`.

---

## 6. Roadmap

*   **Phase 1**: Integrate real SMS provider (e.g. Twilio) and SMTP mail sender.
*   **Phase 2**: Implement real Apple & Google OAuth verifiers.
*   **Phase 3**: Integrate WebCrypto client-side End-to-End Encryption (E2EE) keys exchanges for Chat payloads.
*   **Phase 4**: Setup stripe webhook endpoints for subscriptions.
