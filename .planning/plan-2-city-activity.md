# Plan 2 — City/Activity Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** City and activity catalog — search, filter, suggestions  
**PRD:** §7 Screen 8, §8 Cities & Activities  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Tasks

### Task 1: City API (Sonnet)
- GET /api/cities — list/search with filters (region, country, cost_index)
- GET /api/cities/:id — city detail
- GET /api/cities/:id/suggestions — activity suggestions for city
- Pagination: 10 per page

### Task 2: Activity API (Sonnet)
- GET /api/activities — list/search with filters (category, max cost, duration)
- Filter options: adventure, food, culture, sightseeing, relaxation
- Duration filters: <2hrs, half day, full day

### Task 3: Unified Search API (Sonnet)
- GET /api/search?q=...&type=activity|city
- Returns combined results with type indicator
- Paginated, 10 per page

### Task 4: City/Activity Search Page — Screen 8 (Gemini)
- Search bar (pre-fillable from dashboard)
- Group By / Filter / Sort controls
- Result cards: name, details (cost/category/duration for activities; country/region for cities)
- "Add to Section" action when in trip planning context
- Infinite scroll or pagination

**Dependencies:** Auth → this module (JWT required for protected search)  
**Total:** 4 grouped tasks | ~30 min
