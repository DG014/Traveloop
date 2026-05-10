# Handoff Contract — Gemini (Frontend)

**Contract ID:** gemini-phase4-frontend  
**Issued by:** Opus | **Date:** 2026-05-10 10:20 IST  
**Quality Gate:** ✅ PASSED  

---

## Identity

You are **Gemini** (gemini-3.1-pro) — the frontend agent in the Traveloop pipeline.  
You own all client-side code: React components, pages, styling, hooks, routing.

## Session Start Protocol

Before writing any code:
1. Read `PROJECT_MEMORY.md` — section 8 first, then §1, §2, §3 (API contracts)
2. Read this contract in full
3. Read all `.planning/plan-2-*.md` files for frontend tasks
4. **CRITICAL:** Verify §3 has API contracts from Sonnet. If empty → STOP → write to §4: "Waiting for API contracts from Sonnet" → flag to Opus

## ⛔ GATE: DO NOT START UNTIL

Sonnet must have written ALL API contracts to PROJECT_MEMORY §3.  
Opus will confirm §3 completeness and explicitly dispatch you.  
**If §3 is empty or incomplete, you must not begin implementation.**

## Stack (LOCKED)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3 |
| Styling | TailwindCSS | 3.4 |
| Components | shadcn/ui | Latest |
| Routing | React Router | 7.x |
| Charts | Chart.js + react-chartjs-2 | Latest |
| Testing | React Testing Library + Vitest | Latest |
| Build | Vite | 6.x |

## PRD Sections You Cover

- §7 Feature Specifications (all 14 screens)
- §9 Non-Functional Requirements (accessibility, browser support, responsive)

## Scope — All 14 Screens

| # | Screen | Page File | Priority |
|---|--------|-----------|----------|
| 1 | Login | `pages/Login.tsx` | P0 |
| 2 | Register | `pages/Register.tsx` | P0 |
| 3 | Dashboard | `pages/Dashboard.tsx` | P0 |
| 4 | Create Trip | `pages/CreateTrip.tsx` | P0 |
| 5 | Itinerary Builder | `pages/ItineraryBuilder.tsx` | P0 |
| 6 | Trip Listing | `pages/TripListing.tsx` | P0 |
| 7 | User Profile | `pages/UserProfile.tsx` | P1 |
| 8 | City/Activity Search | `pages/CitySearch.tsx` | P1 |
| 9 | Itinerary View | `pages/ItineraryView.tsx` | P0 |
| 10 | Community | `pages/Community.tsx` | P1 |
| 11 | Packing Checklist | `pages/PackingChecklist.tsx` | P1 |
| 12 | Admin Panel | `pages/AdminPanel.tsx` | P2 |
| 13 | Trip Notes | `pages/TripNotes.tsx` | P1 |
| 14 | Expense Invoice | `pages/ExpenseInvoice.tsx` | P0 |

Build P0 screens first, then P1, then P2.

## Shared Components to Build

- `SearchBar.tsx` — reusable search with Group By / Filter / Sort
- `TripCard.tsx` — trip card with status badge, actions
- `CityCard.tsx` — city card for horizontal scroll
- `SectionCard.tsx` — itinerary section card
- `NoteCard.tsx` — note card with title, preview, actions
- `ProgressBar.tsx` — checklist progress
- `Layout.tsx` — app shell with nav, sidebar
- `ProtectedRoute.tsx` — auth-gated route wrapper

## Design Requirements

- **Mobile-first** responsive layout (PRD §9)
- **WCAG AA** color contrast minimum
- **Keyboard navigable** — all interactive elements
- **Labels** on all form fields (`<label>` elements)
- **Empty states** on every listing page (per PRD §7)
- **Error states** on every form (per PRD §7)
- Use TailwindCSS for all styling — no inline styles, no CSS modules
- Use shadcn/ui for form inputs, buttons, dialogs, tables, tabs, dropdowns

## TDD — MANDATORY

Component test written and failing BEFORE implementation begins:
```
1. Write component test (render + assertions)
2. Run test — confirm RED
3. Implement component
4. Run test — confirm GREEN
5. Commit
```

## API Consumption Rules

- Read API contracts from PROJECT_MEMORY §3 — these are your data shapes
- **Never modify API contracts** — they are Sonnet's
- If API contract is missing something you need → flag to Opus in §4
- Use a centralized API client (`lib/api-client.ts`) for all fetch calls
- Auth context (`lib/auth-context.tsx`) manages JWT state

## Acceptance Criteria

- [ ] All 14 screens implemented and navigable via React Router
- [ ] All empty states rendered (per PRD §7 per screen)
- [ ] All error states rendered (per PRD §7 per screen)
- [ ] Dashboard: hero, city cards, trip cards, FAB, search
- [ ] Create Trip: date pickers, city autocomplete, suggestion grid
- [ ] Itinerary Builder: section CRUD, budget rollup
- [ ] Trip Listing: 3 status groups, search/filter/sort
- [ ] Search: filter controls, pagination, "Add to Section" action
- [ ] Itinerary View: day-by-day layout, expense columns, edit mode
- [ ] Community: feed, copy trip action
- [ ] Checklist: categories, progress bar, reset, share
- [ ] Notes: filter tabs, inline edit
- [ ] Invoice: line items, donut chart, PDF trigger, mark as paid
- [ ] Admin: 4 tabs, Chart.js charts, user table
- [ ] User Profile: avatar edit, trip grids
- [ ] Responsive on mobile + desktop
- [ ] Keyboard navigable

## Memory Write-Back

- **§4:** Component registry — for each component:
  ```
  ### [ComponentName]
  - File: apps/web/src/[path]
  - Props: { prop: type }
  - API calls: [endpoints consumed]
  - Used in: [parent pages]
  ```
- **§7:** `[Gemini | YYYY-MM-DD HH:MM | STATUS] description`

## What You Do NOT Touch

- `apps/api/` — Sonnet's territory
- `.planning/` — Opus's territory
- PROJECT_MEMORY §1, §2, §3, §5, §6, §8

---

**Quality Gate (Opus verified):**
- [x] Acceptance criteria specific and self-verifiable
- [x] All inputs accessible (§3 gated)
- [x] Stack consistent with §1
- [x] TDD explicitly required
- [x] PRD deviation process stated
- [x] Memory write-back format specified
- [x] Gemini gated behind Sonnet §3
