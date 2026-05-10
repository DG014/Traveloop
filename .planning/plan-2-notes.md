# Plan 2 — Notes Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Trip journal/notes — create, edit, filter by day or stop  
**PRD:** §7 Screen 13, §8 Notes  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Tasks

### Task 1: Notes CRUD API (Sonnet)
- GET /api/trips/:tripId/notes — list notes, sortable by created_at (newest first)
- POST /api/trips/:tripId/notes — create note (title, content, day_number, section_id)
- PATCH /api/trips/:tripId/notes/:noteId — update note
- DELETE /api/trips/:tripId/notes/:noteId — delete note
- Filter params: ?day_number=3 or ?section_id=uuid

### Task 2: Trip Notes Page — Screen 13 (Gemini)
- Trip selector dropdown
- "+ Add Note" button
- Filter tabs: All / By Day / By Stop
- Note cards: title, content preview, day label, timestamp, edit/delete icons
- Inline editor or modal for full content editing

**Dependencies:** Auth → Trip → this module  
**Total:** 2 grouped tasks | ~20 min
