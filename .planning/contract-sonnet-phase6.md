# Contract: Sonnet — Phase 6 Backend Stabilization

**Agent:** Sonnet (Claude Sonnet)  
**Phase:** 6 — Integration Polish  
**Scope:** `apps/api/` only — DO NOT touch `apps/web/`  
**Database:** Neon PostgreSQL (connection string in `apps/api/.env`)  
**Dev Server:** `npm run dev` → port 3001  

---

## SESSION START PROTOCOL

1. Read `PROJECT_MEMORY.md` — §3 for API contracts, §7 for change log
2. Run `cd apps/api && npm run test` to verify baseline (expect 22/22 green)
3. Run `npm run dev` to start backend
4. Execute tasks in order below

---

## Tasks

### S6-1: PDF Invoice Export Endpoint ⚡ HIGH

**What:** Add `GET /api/trips/:tripId/invoice/pdf` endpoint  
**Why:** Frontend has Export PDF button but it hits a dead endpoint  

**Implementation:**
```
1. In invoice route file, add GET /:tripId/invoice/pdf handler
2. Fetch invoice data using existing invoice service
3. Generate HTML template with trip header, line items, totals
4. Use puppeteer to render HTML → PDF buffer
5. Return with headers:
   Content-Type: application/pdf
   Content-Disposition: attachment; filename="INV-{number}.pdf"
```

**Template must include:**
- Traveloop branding header
- Trip name, dates, traveler info
- Line items table: #, Description, Category, Qty, Unit Cost, Amount
- Footer: Subtotal, Tax (5%), Discount, Grand Total
- Payment status badge

**Verify:** `curl -b cookies.txt localhost:3001/api/trips/<TRIP_ID>/invoice/pdf -o test.pdf`

---

### S6-2: Admin Analytics Endpoints ⚡ MEDIUM

**What:** Verify/implement real analytics data from Prisma  

**Endpoints needed:**
```
GET /api/admin/stats
Response: {
  totalUsers: number,
  totalTrips: number,
  avgTripsPerUser: number,
  popularCity: { name, country, tripCount },
  activeTrips: number
}

GET /api/admin/trends  
Response: {
  newUsersOverTime: [{ date: string, count: number }],
  tripsPerMonth: [{ month: string, count: number }],
  tripsByStatus: { planned: number, ongoing: number, completed: number }
}
```

**Implementation:** Use Prisma aggregation queries:
- `prisma.user.count()`
- `prisma.trip.groupBy({ by: ['status'], _count: true })`
- `prisma.tripSection.groupBy({ by: ['cityId'], _count: true, take: 1, orderBy: { _count: { cityId: 'desc' } } })`
- For time series: `prisma.$queryRaw` with date_trunc if needed

---

### S6-3: Search Endpoint Enhancement ⚡ MEDIUM

**What:** Verify `GET /api/search` or `/api/cities` + `/api/activities` support text search  

**Requirements:**
- Case-insensitive search: `WHERE name ILIKE '%query%'`
- Filter by category (activities), costIndex (cities)
- Pagination: page + limit params
- Return envelope: `{ success, data, meta: { page, limit, total } }`

---

### S6-4: Community View Count Increment ⚡ LOW

**What:** `GET /api/community/posts/:slug` should increment `viewCount`  

**Requirements:**
- Accept optional `x-session-id` header for dedup
- Return full trip with sections and activities for public display
- Only increment once per session

---

## Verification Checklist

```bash
# Run ALL before claiming COMPLETE
cd apps/api
npm run test          # Must be 22+ tests green
npm run build         # Must compile with 0 TS errors
curl localhost:3001/api/admin/stats      # Returns real numbers
curl localhost:3001/api/admin/trends     # Returns time-series data
curl localhost:3001/api/search?q=tokyo   # Returns matching cities
```

## On Completion

Add entry to `PROJECT_MEMORY.md §7`:
```
[Sonnet | <timestamp> | COMPLETE] Phase 6 backend: PDF export, admin analytics, search enhancement done.
```
