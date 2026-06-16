# Arova Backend

Arova is a private space for two people in a relationship — *A quiet place for everything you share.* 

This repository contains the backend codebase built with **ASP.NET Core** and **.NET 10**, designed to support the Arova Angular web application.

---

## Tech Stack

*   **Runtime**: .NET 10.0 SDK
*   **Framework**: ASP.NET Core Web API (Controllers)
*   **Database**: EF Core with SQLite (for local development)
*   **Authentication**: JWT Bearer Tokens
*   **Real-time Services**: SignalR for couple-scoped chat synchronization
*   **Documentation**: Swagger/OpenAPI (via Swashbuckle)

---

## Architecture Summary

The backend codebase follows a clean, decoupled layer structure:
*   `Controllers/` — Exposes HTTP API endpoints.
*   `Services/` — Handles business logic, safety checks, and permission verification.
*   `DTOs/` — Defines strong contracts for API requests and response formats.
*   `Entities/` — EF Core persistence models mapped to database tables.
*   `Data/` — Holds the `AppDbContext` containing fluent mappings and seed data.
*   `Hubs/` — Implements the SignalR Hub for real-time notifications.
*   `Auth/` — Encapsulates JWT creation and PBKDF2 password hashing.

*Note: Technical folders, namespace declarations, and configuration sections still use the internal project identifiers to maintain database compatibility and prevent migration errors.*

---

## Local Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [.NET 10 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)
*   [EF Core CLI tool](https://learn.microsoft.com/en-us/ef/core/cli/dotnet) (install globally using: `dotnet tool install --global dotnet-ef`)

### 2. Configuration Setup
By default, the backend relies on configuration files to read settings. Copy the example settings file to create your development configuration:
```bash
cp OurLittleUniverse/appsettings.example.json OurLittleUniverse/appsettings.Development.json
```
If using Visual Studio, it will load launch profiles defined in `Properties/launchSettings.json` with `ASPNETCORE_ENVIRONMENT=Development`.

### 3. Restore and Build
Run the following commands in the directory containing the solution file (`OurLittleUniverse.slnx`):
```bash
dotnet restore
dotnet build
```

### 4. Database Setup and Migrations
Arova uses Entity Framework Core migrations to map model definitions to the SQLite schema. Apply the existing migrations to generate your local database file (`loveuniverse-dev.db`):
```bash
dotnet ef database update --project OurLittleUniverse
```

### 5. Running the Application
To launch the Web API server locally:
```bash
dotnet run --project OurLittleUniverse
```
The server will run on `http://localhost:5036`.

---

## URLs and Endpoints

*   **API Local Root**: `http://localhost:5036`
*   **Swagger UI Documentation**: `http://localhost:5036/swagger` (Development mode only)
*   **API Health Endpoint**: `GET http://localhost:5036/api/health`
*   **SignalR Couple Hub**: `ws://localhost:5036/hubs/couple` (Requires query string token `?access_token={JWT}`)

---

## Authentication and Verification Flow

1.  **Registration**: Register a new user using `POST /api/auth/register`.
2.  **Verification**: 
    *   Verify the email address by calling `POST /api/auth/request-verification-code`.
    *   In local development, **the verification code is printed to the console output** (using `ConsoleEmailSender`).
    *   Submit the code to `POST /api/auth/verify-code` to mark the account as verified.
3.  **Login**: Call `POST /api/auth/login` to obtain a JWT access token.
4.  **Authorized Requests**: Secure all protected endpoints by passing the token in the headers:
    ```http
    Authorization: Bearer {JWT_TOKEN}
    ```

---

## SignalR Real-time Hub

The SignalR hub `CoupleHub` handles real-time updates for paired couples:
*   Incoming JWTs are authenticated via custom query string extraction.
*   Once validated, users are placed into a SignalR group scoped to their specific `CoupleId`.
*   Creating a chat message broadcast events only to the sender's couple group to prevent message leakage.

---

## Known Limitations and Security Notes

*   **No Real SMS Provider**: The phone verification endpoint is a placeholder (`ConsoleSmsSender`) returning a clean "Provider not configured" response. Email verification should be used during evaluation.
*   **No Real OAuth Credentials**: External logins (Google, Apple) are placeholders that return "Provider not configured" messages, preventing credentials leaks.
*   **No Real Payment Processing**: Gifted upgrades are supported without requiring live payment processors.
*   **No E2EE Claim**: Chat messages are scope-protected at the database and SignalR group level to ensure privacy between couples. However, the system does not implement client-side End-to-End Encryption (E2EE) using WebCrypto APIs in this version.
*   **Development Security**: The development JWT signing key is committed inside the example configurations. Real production deployments must configure a secure environment variable `JwtSettings__SecretKey` or use ASP.NET Core User Secrets.
