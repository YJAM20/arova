# Arova Local Run Guide

## Requirements

- .NET 10 SDK
- Local terminal from the backend project folder:

```powershell
cd C:\Users\yajm2\source\repos\OurLittleUniverse\OurLittleUniverse
```

## Check .NET

```powershell
dotnet --version
```

## Restore Packages

```powershell
dotnet restore
```

## Database Migration

The local SQLite connection string is:

```text
Data Source=loveuniverse-dev.db
```

Apply migrations with:

```powershell
dotnet ef database update
```

If `dotnet ef` is missing:

```powershell
dotnet tool install --global dotnet-ef
```

## Run

```powershell
dotnet run
```

The HTTP profile listens on:

```text
http://localhost:5036
```

## Swagger

Open:

```text
http://localhost:5036/swagger
```

Register or log in, copy the returned JWT token, click Authorize in Swagger, and enter:

```text
Bearer YOUR_TOKEN_HERE
```

## Local Verification

Email verification writes the development code to the local console/log. Phone verification is intentionally unavailable in this portfolio environment.

## Common Errors

- `401 Unauthorized`: Missing or expired Bearer token.
- `404 Create or join a couple space first`: The user is authenticated but not in an active couple.
- `Failed to determine the https port for redirect`: Usually safe during local HTTP testing. Use the HTTPS launch profile later if HTTPS redirection needs to be fully exercised.
- `dotnet ef is not recognized`: Install the EF tool with `dotnet tool install --global dotnet-ef`.
