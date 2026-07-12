# Design Spec: Repository Hygiene & Developer Onboarding

**Date**: 2026-07-12  
**Author**: Antigravity  
**Status**: Approved (User approved the conceptual design and delegated full implementation details)

---

## 1. Goal Description

This design details the addition of repository hygiene documentation and developer onboarding tools for the open-source GitHub release of Arova. We will create a `setup.ps1` automation script, a `CONTRIBUTING.md` guide, and GitHub issue templates.

---

## 2. Onboarding & Hygiene Structure

```text
Arova Root/
├── setup.ps1                       # One-click developer setup automation script
├── CONTRIBUTING.md                  # Development guidelines, standards, and test protocols
└── .github/
    └── ISSUE_TEMPLATE/
        ├── bug_report.md            # Standard template for bugs
        └── feature_request.md       # Standard template for features
```

---

## 3. Proposed Changes

### Root Folder

#### [NEW] [setup.ps1](file:///c:/Dev/Arova/setup.ps1)
A comprehensive PowerShell script that:
- Detects required SDK runtimes (.NET 10, Node.js).
- Restores backend packages (`dotnet restore`).
- Installs frontend node modules (`npm install`).
- Performs EF database updates for SQLite connection.
- Verifies compilation output status.

#### [NEW] [CONTRIBUTING.md](file:///c:/Dev/Arova/CONTRIBUTING.md)
Detailed markdown document instructing contributors on:
- Code standards (C# naming conventions, Angular standalone component usage, styling guide).
- Local environment setup (using SQLite by default, configuring Twilio or Resend credentials).
- Testing suites (Running XUnit backend tests, Vitest frontend tests, Playwright E2E suites).
- Pull Request verification guidelines.

### GitHub Templates

#### [NEW] [.github/ISSUE_TEMPLATE/bug_report.md](file:///c:/Dev/Arova/.github/ISSUE_TEMPLATE/bug_report.md)
Provides fields for environment details, steps to reproduce, actual vs expected outcomes, and screenshots.

#### [NEW] [.github/ISSUE_TEMPLATE/feature_request.md](file:///c:/Dev/Arova/.github/ISSUE_TEMPLATE/feature_request.md)
Provides fields for problem statement, proposed solution, alternative ideas considered, and user stories.

---

## 4. Verification Plan

### Automated Verification
- Run `.\setup.ps1` locally in a fresh console to confirm the script parses correctly, checks dependencies, restores packages, and compiles targets cleanly.
