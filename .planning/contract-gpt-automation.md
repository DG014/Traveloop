# Handoff Contract — GPT (Automation & Scripts)

**Contract ID:** gpt-phase4-automation  
**Issued by:** Opus | **Date:** 2026-05-10 10:20 IST  
**Quality Gate:** ✅ PASSED  

---

## Identity

You are **GPT** (gpt-oos-120b) — the automation/scripts agent.  
You own infrastructure, seed data, PDF templates, and documentation.

## Session Start Protocol

1. Read `PROJECT_MEMORY.md` — section 8 first, then §1, §2
2. Read this contract in full
3. Begin work immediately — you have no upstream blocks

## Stack (LOCKED)

| Tool | Version | Purpose |
|------|---------|---------|
| Docker Compose | 2.x | PostgreSQL container |
| PostgreSQL | 16 | Database |
| Puppeteer | 23.x | PDF rendering |
| Node.js | 20 LTS | Script runtime |
| TypeScript | 5.5 | Script language |

## Scope — What You Build

### Task 1: Docker Compose (FIRST — other agents need this)
- **File:** `docker-compose.yml`
- PostgreSQL 16 container
- Persistent volume for data
- Port 5432 exposed
- Environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- `.env.example` with all required variables

### Task 2: Seed Data Script
- **File:** `apps/api/prisma/seed.ts`
- 5 cities: Paris, Tokyo, New York City, Bali, London
  - Each with: name, country, region, cover_photo (placeholder URL), cost_index, description
- 20 activities (4 per city): mix of adventure, food, culture, sightseeing
  - Each with: name, description, category, avg_cost, duration_hrs
- 2 demo users:
  - admin@traveloop.com (role: admin, password: Admin123!)
  - traveler@traveloop.com (role: user, password: Travel123!)
- 3 demo trips with full data:
  - Trip 1: "European Summer" (Paris → London) — 2 sections, 6 activities, budget items
  - Trip 2: "Tokyo Adventure" — 1 section, 4 activities, budget items, checklist
  - Trip 3: "Bali Retreat" — 1 section, 3 activities, published to community

### Task 3: Invoice PDF Template
- **File:** `apps/api/src/templates/invoice.html`
- HTML template matching PRD §7 Screen 14 layout:
  - Trip header: name, dates, city count
  - Invoice metadata: ID, date, travelers, status
  - Line item table: #, category, description, qty, unit cost, amount
  - Footer: subtotal, tax (5%), discount, grand total
- Puppeteer renders this template to PDF
- Template uses Handlebars-style `{{variable}}` placeholders

### Task 4: README.md
- **File:** `README.md` (project root)
- Setup instructions:
  1. Prerequisites (Node 20, Docker)
  2. Clone + install (`npm install`)
  3. Start database (`docker compose up -d`)
  4. Run migrations (`npx prisma migrate dev`)
  5. Seed data (`npx prisma db seed`)
  6. Start backend (`npm run dev -w apps/api`)
  7. Start frontend (`npm run dev -w apps/web`)
- Environment variables table
- Project structure overview
- Tech stack summary

## Acceptance Criteria

- [ ] `docker compose up -d` starts PostgreSQL successfully
- [ ] Seed script runs without errors after migration
- [ ] Seed creates exactly: 5 cities, 20 activities, 2 users, 3 trips
- [ ] Demo admin user can login with admin@traveloop.com / Admin123!
- [ ] Invoice HTML template renders valid PDF via Puppeteer (< 5 seconds)
- [ ] README.md has complete setup instructions — new developer can run project from scratch

## TDD

- Seed script: test that seed creates expected record counts
- PDF template: test that Puppeteer renders without errors and output is valid PDF

## Memory Write-Back

- **§5:** Artifact registry:
  ```
  ### [Artifact Name]
  - File: [exact path]
  - Description: [what it does]
  - Consumed by: [which agent uses it]
  ```
- **§7:** `[GPT | YYYY-MM-DD HH:MM | STATUS] description`

## What You Do NOT Touch

- `apps/api/src/modules/` — Sonnet's territory
- `apps/web/` — Gemini's territory
- `.planning/` — Opus's territory
- PROJECT_MEMORY §1, §2, §3, §4, §6, §8

---

**Quality Gate (Opus verified):**
- [x] Acceptance criteria specific and self-verifiable
- [x] All inputs accessible
- [x] Stack consistent with §1
- [x] TDD required for seed + PDF
- [x] Memory write-back format specified
- [x] No unresolved assumptions
