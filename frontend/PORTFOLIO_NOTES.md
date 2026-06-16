# Arova - Technical Architecture & Portfolio Notes

Arova is a private couples space application prototype designed to showcase modern full-stack web engineering, resilient state synchronization, real-time communication, and responsive front-end layouts.

---

## 🛠️ Technical Highlights

### 1. Dual-Storage Engine Architecture
One of the most notable architectural details of Arova is its dual-mode engine:
* **Local Mode (Client-First)**: Employs a browser-only `LocalStorage` wrapper service to read/write serialized state payloads. It allows the app to operate entirely standalone with dummy profiles and mock content, making it perfect for rapid reviews or offline showcases.
* **API Mode (Cloud-Synced)**: Toggles route guards and network services to execute HTTP operations against an ASP.NET Core Web API, using JWT token exchanges to persist data inside a relational SQLite database.

### 2. Angular Architecture
* **Standalone Structure**: Built entirely with Angular Standalone Components, directives, and routing models.
* **Component Modularity**: Focuses reusable, responsive UX elements (e.g. `arova-card`, `arova-status-pill`) into dedicated standalone imports.
* **State & Services Separation**: Decouples network communications (`auth-api.service.ts`) from client data models (`auth.service.ts`) to isolate state mappings cleanly.
* **RxJS Pipeline**: Heavily utilizes RxJS observables for data fetching, stream updates, and routing transitions.

### 3. Backend REST API Architecture
* **ASP.NET Core Web API**: Structured as a lightweight REST interface using C# and .NET 10.
* **EF Core & SQLite**: Integrates Entity Framework Core as the Object-Relational Mapper (ORM), storing data safely inside a local SQLite file database.
* **DTO-Based Contracts**: Enforces strict Data Transfer Object (DTO) contracts for API exchanges to prevent leaking internal database schemas and ensure API contract validation.

### 4. Real-time Communication (SignalR)
* **WebSocket Integration**: Integrates ASP.NET Core SignalR to establish bi-directional connection channels for live couples chat.
* **Connection Status Badging**: Dynamically updates client interfaces (showing `connected`, `connecting`, or `offline` pills) via SignalR lifecycle listeners.

### 5. Playwright E2E Testing Framework
* **Smoke Coverage**: Encompasses 39 automated specs verifying public landing pages, local credentials onboarding, setup route guards, and placeholder popups.
* **Resilience Testing**: Utilizes Playwright `page.route` intercepts to mock backend endpoints (like `/api/auth/me` user profile queries), allowing tests to complete cleanly without running a live backend server instance.
* **Cross-Browser Verification**: Tests execute concurrently across Chromium, Firefox, and WebKit to ensure layout and rendering stability.

### 6. Privacy-First Design Decisions
* **Isolated Space Pairing**: Couples are paired using short-lived generated codes, preventing general public visibility.
* **Security Scoping**: Avoids third-party trackers, enforces JWT token storage restrictions, and maintains strict local data backup exports via encrypted or parsed JSON file structures.
* **No False E2EE Claims**: The codebase respects standard security classifications, describing communications as "secure couple-scoped chat" and honestly positioning End-to-End Encryption (E2EE) as a future roadmap item.

---

## 🗺️ Limitations & Roadmap

* **Mock Integrations**: Third-party providers (Google/Apple Auth and SMS Verification) are fully simulated on the client side with placeholder flows, so reviewers can check the user journey without entering real keys.
* **Roadmap Goals**:
  * Real E2EE implementation using Web Crypto API.
  * Real Apple/Google sign-in setups.
  * Native iOS/Android builds using Capacitor.
