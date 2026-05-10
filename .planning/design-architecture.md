# Traveloop — Architecture Document

**Version:** 1.0 | **Status:** LOCKED | **Date:** 2026-05-10

---

## System Overview

Traveloop is a monorepo web application with two apps:
- `apps/api` — Express + TypeScript backend
- `apps/web` — React 18 + TailwindCSS frontend

Communication: REST API + Socket.IO (presence only)  
Database: PostgreSQL 16 via Prisma ORM  
Auth: JWT in httpOnly cookies + bcrypt (12 rounds)

## Data Model (10 tables)

| Table | PK | Key Relations |
|-------|----|----|
| users | UUID | → trips, community_posts |
| trips | UUID | → users. → trip_sections, budget_items, packing_items, trip_notes, invoices, community_posts |
| trip_sections | UUID | → trips, cities. → section_activities |
| cities | UUID | → activities, trip_sections |
| activities | UUID | → cities, section_activities |
| section_activities | UUID | → trip_sections, activities |
| budget_items | UUID | → trips, trip_sections |
| invoices | UUID | → trips |
| packing_items | UUID | → trips |
| trip_notes | UUID | → trips, trip_sections |
| community_posts | UUID | → trips, users |

## API Surface (38 endpoints)

| Module | Endpoints | Auth Required |
|--------|-----------|---------------|
| Auth | 4 | No (except /me) |
| Users | 3 | Yes |
| Trips | 8 | Yes |
| Sections | 4 | Yes |
| Cities & Activities | 4 | Yes |
| Checklists | 5 | Yes |
| Notes | 4 | Yes |
| Community | 4 | Partial (public slug = no) |
| Admin | 5 | Yes (admin role) |
| **Total** | **41** | |

## Security Model

1. JWT in httpOnly cookie — no localStorage exposure to XSS
2. bcrypt 12 rounds — password hashing
3. Rate limiting: 10 req/IP/15min on /api/auth/*
4. Role guard: /api/admin/* requires role='admin'
5. Input sanitization: prevent SQL injection + XSS
6. File uploads: MIME validation + 5MB size limit
7. Cascade deletes with soft delete on trips

## Module Ownership (Agent Boundaries)

```
Sonnet: apps/api/src/modules/*, apps/api/prisma/*, middleware/*
Gemini: apps/web/src/pages/*, apps/web/src/components/*, apps/web/src/hooks/*
GPT:    docker-compose.yml, seed scripts, PDF template, README
Audit:  Read-only review across all
Opus:   .planning/*, PROJECT_MEMORY.md §1-2, architecture docs
```

No agent crosses another's boundary without Opus routing.
