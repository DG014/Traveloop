# Plan 2 — Trip Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Trip CRUD, status management, dashboard, trip listing, trip copy  
**Architecture:** Express routes → trip service → Prisma trip model  
**Tech Stack:** Express 5, TypeScript, Prisma 6  
**PRD Sections:** §7 Screens 3,4,6, §8 Trips  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Epic: Trip Management

### Feature 1: Trip CRUD API

#### Task 1.1: POST /api/trips — Failing Test
- **Files:** `apps/api/src/modules/trip/trip.test.ts`
- **Duration:** 2 min
- **Test:** Create trip with title, start_date, end_date → 201 + trip object with user_id from JWT

#### Task 1.2: POST /api/trips — Implementation
- **Files:** `apps/api/src/modules/trip/trip.controller.ts`, `trip.service.ts`, `trip.routes.ts`
- **Duration:** 3 min
- **Validation:** end_date ≥ start_date, title required
- **Logic:** Create trip linked to auth user → return trip

#### Task 1.3: GET /api/trips — Failing Test + Implementation
- **Files:** `apps/api/src/modules/trip/trip.test.ts`, `trip.service.ts`
- **Duration:** 3 min
- **Acceptance:** Returns user's trips, filterable by status query param
- **Status computation:** Server-side based on today vs start_date/end_date:
  - start_date > today → Upcoming
  - start_date ≤ today ≤ end_date → Ongoing  
  - end_date < today → Completed

#### Task 1.4: GET /api/trips/:id — Failing Test + Implementation
- **Files:** `apps/api/src/modules/trip/trip.test.ts`, `trip.controller.ts`
- **Duration:** 2 min
- **Acceptance:** Returns trip detail with section count; 404 if not found; 403 if not owner

#### Task 1.5: PATCH /api/trips/:id — Failing Test + Implementation
- **Files:** `apps/api/src/modules/trip/trip.test.ts`, `trip.service.ts`
- **Duration:** 3 min
- **Acceptance:** Update trip fields; only owner can update

#### Task 1.6: DELETE /api/trips/:id — Failing Test + Implementation
- **Files:** `apps/api/src/modules/trip/trip.test.ts`, `trip.service.ts`
- **Duration:** 3 min
- **Logic:** Soft delete — set deleted_at timestamp. Hard delete on explicit confirmation param.
- **Cascade:** Per PRD §9 — sections, activities, budget items, notes, checklist items

#### Task 1.7: POST /api/trips/copy/:slug — Failing Test + Implementation
- **Files:** `apps/api/src/modules/trip/trip.test.ts`, `trip.service.ts`
- **Duration:** 5 min
- **Logic:** Per PRD §7 Screen 10:
  - Find trip by public_slug
  - Duplicate trip + sections + section_activities under requesting user
  - Set status='planned', is_public=false
  - Return new trip

---

### Feature 2: Dashboard (Screen 3) — Frontend (Gemini)

#### Task 2.1: Dashboard Page Component
- **Files:** `apps/web/src/pages/Dashboard.tsx`, `Dashboard.test.tsx`
- **Duration:** 5 min
- **Acceptance:** Per PRD §7 Screen 3:
  - Top bar: logo + user avatar
  - Hero banner image
  - Search bar with Group By / Filter / Sort controls
  - "Top Regional Selections" — horizontal scroll city cards
  - "Previous Trips" — completed trip cards
  - "+ Plan a trip" FAB
- **API calls:** GET /api/cities?sort=popular&limit=8, GET /api/trips?status=completed&limit=3
- **Empty state:** "No trips yet. Start planning your first adventure." + CTA

#### Task 2.2: Search Bar Component
- **Files:** `apps/web/src/components/SearchBar.tsx`, `SearchBar.test.tsx`
- **Duration:** 3 min
- **Acceptance:** Input + Group By / Filter / Sort dropdowns. On submit → navigate to /search with query params

---

### Feature 3: Create Trip (Screen 4) — Frontend (Gemini)

#### Task 3.1: Create Trip Page Component
- **Files:** `apps/web/src/pages/CreateTrip.tsx`, `CreateTrip.test.tsx`
- **Duration:** 5 min
- **Acceptance:** Per PRD §7 Screen 4:
  - Start date picker, end date picker
  - City search/autocomplete
  - Suggestion grid: 6 activity cards based on selected city
  - Save → POST /api/trips → redirect to /trips/:id/builder
- **API calls:** GET /api/cities/search?q=..., GET /api/cities/:id/suggestions
- **Validation:** end_date ≥ start_date

---

### Feature 4: Trip Listing (Screen 6) — Frontend (Gemini)

#### Task 4.1: Trip Listing Page Component
- **Files:** `apps/web/src/pages/TripListing.tsx`, `TripListing.test.tsx`
- **Duration:** 5 min
- **Acceptance:** Per PRD §7 Screen 6:
  - Search + Group By / Filter / Sort
  - Three groups: Ongoing, Upcoming, Completed
  - Trip cards: name, destination count, date range, status badge, view/edit/delete actions
- **API calls:** GET /api/trips
- **Delete:** Confirmation dialog → DELETE /api/trips/:id

---

## Dependency Map

```
Auth module (JWT middleware) → blocks ALL trip API tasks
Task 1.1-1.7 (Trip API) → blocks Tasks 2.x, 3.x, 4.x (frontend needs API)
City/Activity module → blocks Task 3.1 (city suggestions in create trip)
```

**Total tasks:** 11 | **Estimated time:** ~25 min backend, ~20 min frontend
