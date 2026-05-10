# Plan 2 — Checklist Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Per-trip packing checklist with categories, progress, reset, share  
**PRD:** §7 Screen 11, §8 Checklists  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Tasks

### Task 1: Checklist CRUD API (Sonnet)
- GET /api/trips/:tripId/checklist — all items grouped by category
- POST /api/trips/:tripId/checklist — add item (category, item_name)
- PATCH /api/trips/:tripId/checklist/:itemId — toggle is_packed
- DELETE /api/trips/:tripId/checklist/:itemId — remove item
- POST /api/trips/:tripId/checklist/reset — set all is_packed=false (keep items)

### Task 2: Default Template Seeding (Sonnet)
- On trip creation, auto-populate default items:
  - Documents: Passport, Flight Tickets, Travel Insurance, Hotel Booking
  - Electronics: Phone Charger, Universal Power Adapter, Earphones

### Task 3: Packing Checklist Page — Screen 11 (Gemini)
- Trip selector dropdown
- Progress bar: "X/Y items packed"
- Category groups with count badges (e.g., "3/4")
- Each item: checkbox, name, delete icon
- "+ Add item" button
- "Reset All" button
- "Share Checklist" button (plain text export)

**Dependencies:** Auth → Trip → this module  
**Total:** 3 grouped tasks | ~25 min
