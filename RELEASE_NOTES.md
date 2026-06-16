# Arova Release Notes

## v1.0.0 — Portfolio Preview

Arova v1.0.0 is the first public portfolio-ready release of the full-stack application.

This release focuses on:

- Full-stack architecture
- Private couple workspace concept
- Angular frontend
- ASP.NET Core backend
- API contracts
- Couple-scoped permissions
- Cinematic Living Nebula UI
- GitHub-ready documentation
- Build/test validation

## Validation

Frontend:

```powershell
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run visual:audit

Backend:

dotnet restore
dotnet build
Limitations

This release is not a production SaaS deployment. Payment, SMS, OAuth, and true E2EE are documented as future roadmap items.