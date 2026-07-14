# Contributing to Arova

Welcome! We are excited that you want to contribute to Arova. Arova is an open-source cinematic workspace for couples to connect, build orbits, share mood boards, swap letters, and track milestones.

Please follow these guidelines to set up your environment, follow coding standards, and submit pull requests.

---

## 🛠️ Technology Stack

- **Backend**: ASP.NET Core Web API (.NET 10.0), Entity Framework Core (SQL Server & SQLite support).
- **Frontend**: Angular v22.0.0, standalone components, Vanilla SCSS.
- **Database**: SQLite by default for lightweight local development; Microsoft SQL Server is fully supported.
- **Testing**:
  - Backend: xUnit.
  - Frontend Unit: Vitest (via Angular CLI builder `npx ng test`).
  - Frontend E2E: Playwright.

---

## 🚀 Getting Started

The easiest way to set up your local development environment is using our automated setup script:

1. Open PowerShell in the project root folder.
2. Run:
   ```powershell
   .\setup.ps1
   ```
This script checks if you have .NET 10 SDK and Node.js installed, restores NuGet packages, installs Node packages, applies initial SQLite database migrations, and compiles both projects to verify everything works out of the box.

---

## 💻 Running Locally

### 1. Running the Backend API
Navigate to the backend directory and launch the API project:
```bash
cd backend/OurLittleUniverse
dotnet run
```
The API is configured to run on `http://localhost:5036`. You can access the Swagger documentation page at `http://localhost:5036/swagger`.

By default, the backend boots in **SQL Server** mode. To switch to **SQLite**, update `Database:Provider` to `"Sqlite"` in `appsettings.json` (or `appsettings.Development.json`).

#### SMS & Email Configuration (Optional)
To test live SMS and email deliveries instead of console output logging, configure the corresponding credentials in `appsettings.json` (or `appsettings.Development.json`):
- **Email (Resend)**: Set `Email:Provider` to `"Resend"`, and provide a valid API key in `Email:ResendApiKey`.
- **SMS (Twilio)**: Set `Sms:Provider` to `"Twilio"`, and provide valid values for `Sms:TwilioAccountSid`, `Sms:TwilioAuthToken`, and `Sms:TwilioFromNumber`.

*Note: If no credentials are supplied, or if the `Provider` key is set to `"Console"` (default), all SMS and email messages will be printed directly to the backend server logs.*

### 2. Running the Frontend client
Navigate to the frontend directory and start the Angular development server:
```bash
cd frontend
npm start
```
The application will open on `http://localhost:4200` in your browser.

---

## 🧪 Testing Guidelines

Before submitting any Pull Request, ensure that all test suites pass successfully.

### Running Backend Tests
Navigate to the backend directory and run xUnit tests:
```bash
cd backend
dotnet test
```

### Running Frontend Unit Tests
Navigate to the frontend directory and run:
```bash
cd frontend
npx ng test
```

### Running Frontend End-to-End (E2E) Tests
Ensure both the backend API (`dotnet run`) and frontend server (`npm start` or building the project) are running, then run Playwright:
```bash
cd frontend
npx playwright test --project=chromium
```

---

## 📝 Coding Standards

- **C# / Backend**:
  - Follow standard .NET coding conventions.
  - Use camelCase for API JSON inputs/outputs.
  - Avoid throwing raw exceptions in core endpoints; return formatted results matching the `ApiResponse<T>` structure.
- **Typescript / Angular**:
  - Follow the Angular Style Guide. Use standalone components.
  - Do not write custom HTTP error-handling logic inside data services; delegate error mapping to the centralized `friendlyErrorHelper` utility from `src/app/core/services/error-handler.utils.ts`.
- **CSS / Styling**:
  - Use Vanilla CSS/SCSS conforming to Arova's **Living Nebula** design system.
  - Avoid adding TailwindCSS utilities unless explicitly requested.
