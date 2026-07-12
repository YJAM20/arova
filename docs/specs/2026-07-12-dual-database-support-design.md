# Design Spec: Dual Database Support (SQL Server & SQLite)

**Date**: 2026-07-12  
**Author**: Antigravity  
**Status**: Approved (User approved the conceptual design and delegated full implementation details)

---

## 1. Goal Description

This design details how the Arova backend project (`OurLittleUniverse`) will support both **Microsoft SQL Server** (user-preferred for portfolio demonstration) and **SQLite** (lightweight default for open-source self-hosters and contributors) dynamically via settings in `appsettings.json`.

---

## 2. Architecture & Config Design

The application will read the database provider from configuration. Depending on the setting, it will resolve the connection string and register the appropriate EF Core driver.

### Database Settings configuration

In `appsettings.json`, we introduce a new `"Database"` section:

```json
{
  "Database": {
    "Provider": "SqlServer", // Options: "SqlServer" or "SQLite"
    "AutoMigrate": true
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=ArovaDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true",
    "SqliteConnection": "Data Source=loveuniverse-dev.db"
  }
}
```

- When `Provider` is `"SqlServer"`, connection string `DefaultConnection` is resolved and `options.UseSqlServer(...)` is configured.
- When `Provider` is `"SQLite"`, connection string `SqliteConnection` (or `DefaultConnection` if structured for SQLite) is resolved and `options.UseSqlite(...)` is configured.

---

## 3. Proposed Changes

### Backend: OurLittleUniverse

#### [MODIFY] [OurLittleUniverse.csproj](file:///c:/Dev/Arova/backend/OurLittleUniverse/OurLittleUniverse.csproj)
- Reference NuGet package `Microsoft.EntityFrameworkCore.Sqlite` (matching target EF Core version `10.0.9`).

#### [MODIFY] [appsettings.json](file:///c:/Dev/Arova/backend/OurLittleUniverse/appsettings.json) and [appsettings.Development.json](file:///c:/Dev/Arova/backend/OurLittleUniverse/appsettings.Development.json)
- Add `"Database:Provider"` setting and `"ConnectionStrings:SqliteConnection"`.

#### [MODIFY] [Program.cs](file:///c:/Dev/Arova/backend/OurLittleUniverse/Program.cs)
- Check `Database:Provider` value.
- Conditional DI registration:
```csharp
var provider = builder.Configuration["Database:Provider"] ?? "SqlServer";
var isSqlite = string.Equals(provider, "SQLite", StringComparison.OrdinalIgnoreCase);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (isSqlite)
    {
        var connectionString = builder.Configuration.GetConnectionString("SqliteConnection")
            ?? builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("SQLite connection string is not configured.");
        options.UseSqlite(connectionString);
    }
    else
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("SQL Server connection string is not configured.");
        options.UseSqlServer(connectionString);
    }
});
```

---

## 4. Migrations Structure

SQL Server and SQLite generate database-specific SQL dialect scripts in their migration histories. To prevent provider clashes, we partition migrations under separate namespaces and directories:

- **SQL Server Migrations**: Located under `Migrations/SqlServer`
- **SQLite Migrations**: Located under `Migrations/Sqlite`

### Creating Migrations
- SQL Server:
  `dotnet ef migrations add InitialSqlServerCreate --context AppDbContext --output-dir Migrations/SqlServer`
- SQLite:
  `dotnet ef migrations add InitialSqliteCreate --context AppDbContext --output-dir Migrations/Sqlite`

---

## 5. Verification Plan

### Automated Verification
- Run `dotnet build` to verify there are no compilation warnings or errors.
- Run `dotnet test` to verify that both SQLite and SQL Server provider setups pass database context verification checks.

### Manual Verification
- Run the application with `Database:Provider = "SQLite"` and verify the creation of `loveuniverse-dev.db`.
- Run the application with `Database:Provider = "SqlServer"` and verify connectivity to LocalDB.
