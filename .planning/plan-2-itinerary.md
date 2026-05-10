# Plan 2 — Itinerary Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Trip sections CRUD, activity linking, day-wise itinerary view  
**PRD:** §7 Screens 5,9, §8 Sections  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Tasks

### Task 1: Section CRUD API (Sonnet)
- **Files:** `apps/api/src/modules/itinerary/itinerary.*.ts`
- POST/GET/PATCH/DELETE for trip_sections
- Validation: trip ownership, dates within trip range
- Ordered by sort_order

### Task 2: Section Activities API (Sonnet)
- POST/PATCH/DELETE for section_activities (link activity to section)
- Fields: activity_id, day_number, scheduled_time, actual_cost, notes

### Task 3: GET /api/trips/:tripId/itinerary (Sonnet)
- Returns sections + activities organized by day_number
- Expense: actual_cost or fallback to avg_cost
- Day totals + trip total computed server-side

### Task 4: Itinerary Builder Page — Screen 5 (Gemini)
- Section cards: title, description, date range, budget, city selector
- "+ Add Section" button, auto-save on blur
- Budget per section rolls up to trip total

### Task 5: Section Card Component (Gemini)
- Reusable card with title, description, dates, budget, city, delete

### Task 6: Itinerary View Page — Screen 9 (Gemini)
- Day-by-day layout with activity list + expense column
- Visual flow connectors, day totals, trip total
- Edit mode for inline cost editing

**Dependencies:** Auth → Trip → this module; City/Activity → Task 2  
**Total:** 6 grouped tasks | ~45 min
