# Plan 2 — Community Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Public trip sharing, community feed, copy trip functionality  
**PRD:** §7 Screen 10, §8 Community  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Tasks

### Task 1: Publishing API (Sonnet)
- POST /api/trips/:tripId/publish — set is_public=true, generate public_slug
- POST /api/trips/:tripId/unpublish — set is_public=false
- Slug format: lowercase trip title + random 4 chars (e.g., "europe-summer-a3x9")

### Task 2: Community Feed API (Sonnet)
- GET /api/community/posts — paginated (10/page), includes user avatar + trip summary
- GET /api/community/:slug — public trip by slug (NO auth required per PRD §10 assumption)
- View count: increment on post open, idempotent per session (track in cookie/session)
- Filter: by destination, trip duration, travel style

### Task 3: Community Tab — Screen 10 (Gemini)
- Search bar + Group By / Filter / Sort
- Feed: user avatar + post content card (trip summary)
- Each post links to read-only public itinerary view
- "Copy Trip" button → POST /api/trips/copy/:slug → redirect to new trip's builder
- Filter controls: destination, duration, style

**Dependencies:** Auth → Trip → this module; Trip copy endpoint (plan-2-trip Task 1.7)  
**Total:** 3 grouped tasks | ~25 min
