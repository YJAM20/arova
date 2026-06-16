# Arova Frontend-Backend Feature Alignment Map

This document outlines how the expanded frontend product features align with the ASP.NET Core backend APIs implemented in the product expansion phase.

---

## 1. Planets System (The Orbit Page)

### Daily Planet Roll
* **Frontend View**: User sees a beautiful interactive map of planets, with a button to roll today's active space planet.
* **Backend Endpoint**: `POST /api/planets/today/roll`
* **Behavior**: Deterministically selects a random active planet for today. Idempotent per date.

### Today's Planet Status
* **Frontend View**: Displays details of today's assigned planet (Key, Name, Description, Theme, Purpose, Difficulty, Est. Minutes, Points) along with completion progress.
* **Backend Endpoint**: `GET /api/planets/today`
* **Response DTO**: `DailyPlanetResponse` (includes total points earned, tasks list, and completion entries with timestamps).

### Planet Task Completion
* **Frontend View**: User checks off one of the three required/optional planet tasks.
* **Backend Endpoint**: `POST /api/planets/tasks/complete`
* **Request DTO**: `CompleteTaskRequest` (includes the unique `TaskKey`).
* **Behavior**: Validates the task key, checks for double completion, saves completion status, and automatically logs points to the relationship score ledger.

---

## 2. Relationship Points & Daily Tasks

### Relationship Score & Ranks
* **Frontend View**: Shows the couple's current total relationship points, a rank progress bar (e.g., Spark, Warmth, Orbit, Bond, Constellation, Gravity, Eclipse, Eternal Orbit), and the percentage to the next rank.
* **Backend Endpoint**: `GET /api/relationship-score`
* **Response DTO**: `RelationshipScoreResponse`

### Score Ledger / Point History
* **Frontend View**: A scrollable history feed showing points earned, actions taken, and who earned them.
* **Backend Endpoint**: `GET /api/relationship-score/ledger`
* **Response DTO**: `IReadOnlyList<PointLedgerEntryResponse>` (returns the last 50 entries ordered by date descending).

### Couple's Daily Tasks
* **Frontend View**: Displays 5 daily randomized couple tasks.
* **Backend Endpoint**: `GET /api/relationship-score/daily-tasks`
* **Behavior**: Generates a deterministic set of 5 tasks for the couple on first access today, selected from a pool of 15 templates.

### Complete Daily Task
* **Frontend View**: Checking off a daily task.
* **Backend Endpoint**: `POST /api/relationship-score/daily-tasks/{id}/complete`
* **Response DTO**: `DailyTaskResponse`

---

## 3. Profile Stats Dashboard

* **Frontend View**: Instagram-like profile view summarizing the user's details and active couple accomplishments.
* **Backend Endpoint**: `GET /api/profile/stats`
* **Response DTO**: `ProfileStatsResponse`
* **Aggregated Stats**:
  - `displayName`, `username`, `avatarUrl`, `bio`
  - `relationshipLengthDays` (days since couple space was created)
  - `relationshipStartedAt` (couple creation date)
  - `totalPoints` (sum of ledger)
  - `currentRank`, `nextRank`
  - Content Counts: `memoriesCount`, `lettersCount`, `reasonsCount`, `planetCompletions`, `chatMessagesCount`

---

## 4. Custom Lists & Sections

* **Frontend View**: Users can create custom lists (e.g., "Places to Travel", "Couples Bucket List") and add checkboxes.
* **Plan Limits Enforced**:
  - Free Plan: Max 1 Section
  - Pro Plan: Max 5 Sections
  - Platinum Plan: Max 20 Sections
* **Backend Endpoints**:
  - `GET /api/custom-sections` (gets all sections and nested list items)
  - `POST /api/custom-sections` (creates a section; checks plan limit)
  - `PUT /api/custom-sections/{id}` (updates section meta)
  - `DELETE /api/custom-sections/{id}` (removes section and all items)
  - `POST /api/custom-sections/{id}/items` (adds checklist item)
  - `PUT /api/custom-sections/{sectionId}/items/{itemId}` (toggles completion or edits item text)
  - `DELETE /api/custom-sections/{sectionId}/items/{itemId}` (removes item)

---

## 5. System Administration Dashboard

* **Frontend View**: Access-controlled dashboard for Await operators.
* **Security**: Enforces the system admin check (`IsSystemAdmin` on `AppUser`). Non-admins receive `403 Forbidden`.
* **Backend Endpoints**:
  - `GET /api/admin/overview` (returns aggregate metrics: total users, active/unverified couples, memory/message counts, subscription tier distributions)
  - `GET /api/admin/feedback` (returns recent user feedback entries)
  - `GET /api/admin/health` (diagnoses database connectivity status)
