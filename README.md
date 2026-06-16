# Arova — A Private Space for Two

Arova is a full-stack relationship companion web application built as a private shared space for two people.

It combines memories, letters, moods, music, future plans, private chat, daily questions, relationship planets, custom sections, and admin/product controls into one calm, cinematic experience.

> Arova is designed as a portfolio-grade full-stack project, not a production SaaS service yet.

---

## Preview

Screenshots can be added under:

```txt
docs/screenshots/

Recommended screenshots:

Landing Page
Auth
Universe Dashboard
Planets
Profile
Custom Sections
Admin Dashboard
Chat
Music
Settings
Project Structure
arova/
  frontend/       Angular frontend
  backend/        ASP.NET Core backend
  docs/           project documentation, screenshots, architecture notes
  .github/        CI workflows
Tech Stack
Frontend
Angular
TypeScript
SCSS
Playwright E2E
Local Mode + API Mode
Living Nebula visual design system
Visual screenshot audit tooling
Backend
ASP.NET Core Web API
Entity Framework Core
SQLite for development
JWT Authentication
SignalR
Swagger
DTO-based API contracts
Couple-scoped permissions
Key Features
Public landing page
Authentication flow
Email verification flow placeholder for development
Onboarding and profile setup
Pairing system for two users
Universe dashboard
Relationship planets and daily tasks
Relationship points and ranks
Memories
Reasons
Letters vault
Mood room
Music room
Challenges
Future plans
Custom sections
Private couple-scoped chat
Admin dashboard
Backup/export tooling
Local Mode and API Mode
Important Product Notes

Arova currently includes placeholders for:

Google / Apple login
SMS verification
Payment / billing
Production cloud backups

These are intentionally documented as placeholders.
The project does not claim real payment, real SMS, real OAuth, or true end-to-end encryption.

Chat is currently described as secure couple-scoped chat. True E2EE is a future roadmap item.

Running the Frontend
cd frontend
npm install
npm.cmd start

Frontend URL:

http://localhost:4200

Build:

npm.cmd run build

E2E tests:

npm.cmd run test:e2e

Visual audit:

npm.cmd run visual:audit
Running the Backend
cd backend\OurLittleUniverse
dotnet restore
dotnet build
dotnet run

Backend URLs:

Swagger: http://localhost:5036/swagger
Health:  http://localhost:5036/api/health

Apply database migrations:

dotnet ef database update
Local Demo Credentials

Frontend Local Mode:

owner / 1234
partner / 1234
Frontend ↔ Backend Connection

The frontend expects the backend at:

http://localhost:5036

The frontend supports:

Local Mode: browser/local storage demo mode
API Mode: connects to ASP.NET Core backend
Validation Checklist

Before committing:

cd frontend
npm.cmd run build
npm.cmd run test:e2e
npm.cmd run visual:audit
cd backend\OurLittleUniverse
dotnet restore
dotnet build

Make sure these are not committed:

node_modules/
dist/
.angular/
playwright-report/
test-results/
visual-audit/latest/
bin/
obj/
*.db
*.sqlite
.env
real secrets
private screenshots
Documentation

See:

docs/
frontend/README.md
backend/OurLittleUniverse/README_BACKEND.md
Version

Current preview:

v1.0.0 — Arova Portfolio Preview
License

This project is currently prepared as a personal portfolio project.