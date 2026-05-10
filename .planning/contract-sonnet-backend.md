# Handoff Contract — Sonnet (Backend)

**Contract ID:** sonnet-phase4-backend  
**Issued by:** Opus | **Date:** 2026-05-10 10:20 IST  
**Quality Gate:** ✅ PASSED  

---

## Identity

You are **Sonnet** (claude-sonnet-4-6) — the backend agent in the Traveloop pipeline.  
You own all server-side code: APIs, data models, database schema, business logic, middleware.

## Session Start Protocol

Before writing any code:
1. Read `PROJECT_MEMORY.md` — section 8 first, then §1 (architecture), §2 (component map)
2. Read this contract in full
3. Read all `.planning/plan-2-*.md` files for backend tasks
4. Confirm PostgreSQL is running (`docker compose up -d`)

## Stack (LOCKED — do not deviate)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20 LTS |
| Framework | Express | 5.x |
| Language | TypeScript | 5.5 |
| ORM | Prisma | 6.x |
| Database | PostgreSQL | 16 |
| Auth | jsonwebtoken 9.x + bcryptjs 3.x | httpOnly cookies |
| Testing | Vitest | Latest |
| File Upload | multer | Latest |

## PRD Sections You Cover

- §5 System Architecture (server layer)
- §6 Database Schema (all 10 tables + indexes)
- §8 API Contract (all 41 endpoints)
- §9 Non-Functional Requirements (security, performance, data integrity)

## Scope — What You Build

### Phase 4A: Foundation (do FIRST)
1. **Project scaffolding** — `apps/api/` with Express + TypeScript + Prisma
2. **Prisma schema** — all 10 tables matching PRD §6 exactly
3. **Database migration** — `npx prisma migrate dev`
4. **Seed script** — 5 cities, 20 activities, 2 demo users, 3 demo trips
5. **Middleware** — JWT auth, role guard, rate limiter, error handler
6. **API response envelope** — `{ success, data, error, meta }` per PRD §8

### Phase 4B: API Contracts → Write to PROJECT_MEMORY §3 FIRST
Before implementing ANY endpoint, write the full API contract to §3:
```
### [Module] — [Endpoint]
- Method: [GET/POST/PATCH/DELETE]
- Path: /api/[path]
- Auth: [required/admin/public]
- Request body: { field: type }
- Response: { field: type }
- Error codes: [400/401/403/404/409]
```

**Gemini is BLOCKED until you complete §3. Write all contracts before implementation.**

### Phase 4C: Module Implementation (TDD)
Build in this order (matches dependency graph):
1. Auth module (login, register, session, middleware)
2. User module (profile CRUD, photo upload)
3. Trip module (CRUD, status, copy, soft delete)
4. City/Activity module (search, filter, suggestions)
5. Itinerary module (sections, activities, full itinerary view)
6. Budget/Invoice module (line items, computation, PDF endpoint)
7. Checklist module (CRUD, reset, default templates)
8. Notes module (CRUD, filters)
9. Community module (publish, feed, public view)
10. Admin module (users, analytics, popular cities/activities)

## TDD — MANDATORY, NO EXCEPTIONS

For every feature:
```
1. Write failing test (RED)
2. Run test — confirm it fails for the RIGHT reason
3. Write minimal implementation (GREEN)
4. Run test — confirm it passes
5. Refactor if needed
6. Commit test + implementation together
```

**If you write implementation code before a failing test exists, it is a pipeline violation. Delete the code and start with the test.**

## Acceptance Criteria

- [ ] Prisma schema: 10 tables, all fields matching PRD §6, all indexes
- [ ] All 41 API endpoints return correct response envelope
- [ ] JWT auth: httpOnly cookie, middleware on all protected routes
- [ ] Role guard: /api/admin/* blocked for non-admin (403)
- [ ] Rate limiter: 10 req/IP/15min on /api/auth/*
- [ ] bcrypt: 12 rounds minimum
- [ ] Cascade deletes per PRD §9
- [ ] Soft delete on trips (deleted_at column)
- [ ] Invoice number: INV-{YEAR}-{RANDOM_5_DIGITS}
- [ ] Seed data: 5 cities, 20 activities, 2 users, 3 trips
- [ ] All endpoints have Vitest tests (RED before GREEN)
- [ ] API contracts written to PROJECT_MEMORY §3 BEFORE implementation

## PRD Deviation Protocol

If the PRD is ambiguous or you need to deviate:
1. Flag in PROJECT_MEMORY §3: `[DEVIATION] PRD §X says Y, implementing Z because [reason]`
2. Continue building — do not block on deviations unless they affect other agents
3. Opus reviews deviations in §3 during monitoring

## Memory Write-Back Format

Write to PROJECT_MEMORY.md:
- **§3:** All API contracts (format above) — BEFORE implementation
- **§7:** `[Sonnet | YYYY-MM-DD HH:MM | STATUS] description`
  - STATUS = STARTED | COMPLETED | BLOCKED | DEVIATION | FLAG

## What You Do NOT Touch

- `apps/web/` — Gemini's territory
- `docker-compose.yml` — GPT's territory  
- `.planning/` — Opus's territory
- PROJECT_MEMORY §1, §2, §4, §5, §6, §8 — other agents own these

## Blocks

- **You block:** Gemini (cannot start until your §3 is complete)
- **You need:** PostgreSQL running (GPT provides docker-compose.yml)
- **If blocked:** Write to §7: `[Sonnet | date | BLOCKED] description` — Opus resolves within 5 min

---

**Quality Gate Checklist (Opus verified):**
- [x] Acceptance criteria are specific and self-verifiable
- [x] All inputs listed exist and are accessible
- [x] Stack choices consistent with §1 decisions
- [x] TDD explicitly required — no ambiguity
- [x] PRD deviation flag process stated
- [x] Memory write-back format specified
- [x] No unresolved assumptions
