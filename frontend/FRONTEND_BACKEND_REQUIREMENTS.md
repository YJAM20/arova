# Frontend to Backend API Requirements

This document outlines the API endpoints and contracts required to support the upgraded features (Planets, Points, Profile details, Custom Spaces, and Feature Flags) when running in **API Mode**. Currently, these features utilize `localStorage` fallback wrappers in **Local Mode**.

---

## 1. User Profile Extensions
Enhance the existing `/api/profile` endpoints to persist metadata.

### `GET /api/profile/me`
* **Response Body**:
  ```json
  {
    "displayName": "Partner A",
    "avatarUrl": "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0",
    "bio": "Shared cosmic traveler.",
    "dateOfBirth": "1998-05-15",
    "ageRange": "25-34",
    "relationshipStatus": "Paired",
    "relationshipType": "Monogamous",
    "preferredLanguage": "en",
    "preferredTheme": "dark-romantic",
    "loveLanguage": "Quality Time",
    "personalityStyle": "Dreamer",
    "matureContentEnabled": true
  }
  ```

### `PUT /api/profile/me`
* **Request Body**: (Same structure as `GET` response)
* **Response**: Updated profile object.

---

## 2. Gamified Relationship Points & Streaks
Manage streaks and points securely on the server to prevent local manipulation.

### `GET /api/relationship/points`
* **Response Body**:
  ```json
  {
    "totalPoints": 340,
    "streak": 5,
    "lastActiveDate": "2026-06-12",
    "rank": {
      "title": "Orbit",
      "minPoints": 250,
      "maxPoints": 499,
      "progressPercent": 36
    }
  }
  ```

### `POST /api/relationship/points/ledger`
* **Request Body**:
  ```json
  {
    "action": "Completed daily planet ritual",
    "points": 50
  }
  ```
* **Response**: Updated points ledger entry.

### `GET /api/relationship/points/ledger`
* **Response Body**:
  ```json
  [
    {
      "id": "pts-1748239482",
      "action": "Completed daily planet ritual",
      "points": 50,
      "timestamp": "2026-06-12T18:00:00Z"
    }
  ]
  ```

---

## 3. Celestial Planets System
Calculates daily seeded planet on the server side and syncs tasks.

### `GET /api/planets/today`
* **Response Body**:
  ```json
  {
    "dateKey": "2026-06-12",
    "planetId": "planet-venus",
    "planetName": "Venus",
    "purpose": "Affection & Intimacy",
    "dailyQuestion": "When did you feel most loved by your partner this week?",
    "tasks": [
      "Send a surprise sweet text right now",
      "Give your partner a long hug when you see them next"
    ],
    "completedTasks": [true, false],
    "rewardClaimed": false
  }
  ```

### `PUT /api/planets/today/tasks/:index`
* **Request Body**:
  ```json
  {
    "completed": true
  }
  ```
* **Response**: Updated completion state array.

---

## 4. Custom Spaces (Custom Sections)
Full CRUD endpoints for custom list indices.

### `GET /api/custom-sections`
* **Response Body**:
  ```json
  [
    {
      "id": "sec-travel",
      "title": "Travel List",
      "icon": "✈️",
      "description": "Places we plan to explore.",
      "items": [
        { "id": "item-1", "content": "Explore Kyoto blossoms", "completed": false, "createdAt": "2026-06-12T18:00:00Z" }
      ],
      "createdAt": "2026-06-12T18:00:00Z",
      "updatedAt": "2026-06-12T18:00:00Z"
    }
  ]
  ```

### `POST /api/custom-sections`
* **Request Body**:
  ```json
  {
    "title": "Inside Jokes",
    "icon": "🎭",
    "description": "Fun quotes."
  }
  ```

### `PUT /api/custom-sections/:id`
* **Request Body**: (Updates title, icon, or description)

### `DELETE /api/custom-sections/:id`

### `POST /api/custom-sections/:id/items`
* **Request Body**:
  ```json
  {
    "content": "A joke about coding"
  }
  ```

### `PUT /api/custom-sections/:id/items/:itemId`
* **Request Body**:
  ```json
  {
    "completed": true
  }
  ```

### `DELETE /api/custom-sections/:id/items/:itemId`
