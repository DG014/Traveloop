# Traveloop — Product Requirements Document
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** May 2026  
**Owner:** Traveloop Hackathon Team  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [User Personas](#4-user-personas)
5. [System Architecture Overview](#5-system-architecture-overview)
6. [Database Schema](#6-database-schema)
7. [Feature Specifications](#7-feature-specifications)
8. [API Contract](#8-api-contract)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Constraints & Assumptions](#10-constraints--assumptions)
11. [Open Questions](#11-open-questions)
12. [Out of Scope](#12-out-of-scope)
13. [Milestones & Delivery Plan](#13-milestones--delivery-plan)

---

## 1. Executive Summary

Traveloop is a web-based, multi-user travel planning platform that enables individuals and groups to design, manage, and share multi-city trip itineraries end-to-end. The platform covers every stage of the travel planning lifecycle — from destination discovery and itinerary construction, to budget tracking, packing management, in-trip journaling, and post-trip community sharing.

The immediate context is a hackathon build. This PRD is written to production standards: decisions made here should be defensible in a post-hackathon product review, and the architecture should not require re-platforming to scale.

---

## 2. Problem Statement

Planning a multi-city trip today requires juggling 4–6 disconnected tools: spreadsheets for itineraries, notes apps for hotel details, calculator for budgets, separate apps for packing lists, and social media for inspiration. There is no single tool that handles the full loop from inspiration → planning → execution → reflection → sharing.

Traveloop closes this loop. A user should be able to go from "I want to visit Europe for 10 days" to a structured, budgeted, shareable itinerary without leaving the platform.

---

## 3. Goals & Success Metrics

### Primary Goals (Hackathon Scope)
- Functional end-to-end trip creation and management flow
- Relational database with normalized schema supporting all entities
- All 14 wireframed screens implemented and connected
- Real-time multi-user collaboration indicators (live cursors visible in wireframes)

### Success Metrics

| Metric | Target |
|---|---|
| Trip creation to itinerary in < N clicks | ≤ 8 clicks |
| Page load time (dashboard) | < 2 seconds |
| All 14 screens navigable without errors | 100% |
| Budget calculation accuracy | Exact match to sum of line items |
| Packing checklist persistence across sessions | 100% |
| Admin dashboard data freshness | Near real-time (< 30s lag) |

---

## 4. User Personas

### Persona 1 — The Solo Planner (Primary)
- Plans 2–4 international trips per year
- Researches heavily before booking
- Wants everything in one place
- Core pain: switching between 5 apps to plan one trip

### Persona 2 — The Group Coordinator
- Planning trips for 3–8 people
- Needs to share itineraries and track shared expenses
- Core pain: version control — everyone has a different version of "the plan"

### Persona 3 — The Community Browser
- Not actively planning but exploring ideas
- Consumes public itineraries from other travelers
- Core pain: no structured way to browse real traveler plans (vs. travel blogs)

### Persona 4 — Platform Admin
- Monitors platform health, user activity, popular destinations
- Manages user accounts
- Core pain: no visibility into what cities/activities are trending

---

## 5. System Architecture Overview

### Tech Stack (Recommended)

| Layer | Technology |
|---|---|
| Frontend | React.js + TailwindCSS |
| Backend | Node.js (Express) or Python (FastAPI) |
| Database | PostgreSQL (relational, as required by problem statement) |
| Auth | JWT-based session auth with bcrypt password hashing |
| File Storage | Local for hackathon / S3-compatible for production |
| Real-time | WebSocket or Socket.IO (for live collaboration cursors) |
| PDF Export | pdfkit / puppeteer (for invoice export) |

### Application Layers

```
Client (Browser)
    │
    ▼
REST API / WebSocket Server
    │
    ├── Auth Middleware (JWT)
    ├── Route Handlers (per feature module)
    │
    ▼
Service Layer (Business Logic)
    │
    ▼
Data Access Layer (ORM / Query Builder)
    │
    ▼
PostgreSQL Database
```

### Module Breakdown

- **Auth Module** — Login, Register, Session management
- **User Module** — Profile CRUD, preferences
- **Trip Module** — Trip CRUD, status management
- **Itinerary Module** — Sections, stops, day-wise activities
- **Activity/City Module** — Search, catalog, suggestions
- **Budget Module** — Line items, invoice generation, expense tracking
- **Checklist Module** — Packing list per trip
- **Notes Module** — Journal entries per trip/stop
- **Community Module** — Public sharing, feed
- **Admin Module** — Analytics, user management

---

## 6. Database Schema

### Core Tables

```sql
-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    city          VARCHAR(100),
    country       VARCHAR(100),
    password_hash TEXT NOT NULL,
    profile_photo TEXT,
    bio           TEXT,
    role          VARCHAR(20) DEFAULT 'user', -- 'user' | 'admin'
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Trips
CREATE TABLE trips (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    cover_photo    TEXT,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    total_budget   NUMERIC(12, 2),
    status         VARCHAR(20) DEFAULT 'planned', -- 'planned' | 'ongoing' | 'completed'
    is_public      BOOLEAN DEFAULT FALSE,
    public_slug    VARCHAR(100) UNIQUE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Sections (Stops / Cities in itinerary)
CREATE TABLE trip_sections (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE,
    city_id     UUID REFERENCES cities(id),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    budget      NUMERIC(12, 2),
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE cities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    region          VARCHAR(100),
    cover_photo     TEXT,
    cost_index      VARCHAR(20), -- 'budget' | 'mid-range' | 'luxury'
    popularity_rank INTEGER,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE activities (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id      UUID REFERENCES cities(id),
    name         VARCHAR(255) NOT NULL,
    description  TEXT,
    category     VARCHAR(100), -- 'adventure' | 'food' | 'sightseeing' | 'culture' | etc.
    avg_cost     NUMERIC(10, 2),
    duration_hrs NUMERIC(4, 1),
    cover_photo  TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Section Activities (many-to-many)
CREATE TABLE section_activities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id  UUID REFERENCES trip_sections(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id),
    day_number  INTEGER,
    scheduled_time TIME,
    actual_cost NUMERIC(10, 2),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Line Items
CREATE TABLE budget_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE,
    section_id  UUID REFERENCES trip_sections(id),
    category    VARCHAR(100), -- 'hotel' | 'travel' | 'food' | 'activity' | 'misc'
    description VARCHAR(255) NOT NULL,
    qty         NUMERIC(8, 2) DEFAULT 1,
    unit_cost   NUMERIC(12, 2) NOT NULL,
    amount      NUMERIC(12, 2) GENERATED ALWAYS AS (qty * unit_cost) STORED,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id        UUID REFERENCES trips(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    generated_at   TIMESTAMPTZ DEFAULT NOW(),
    subtotal       NUMERIC(12, 2),
    tax_rate       NUMERIC(5, 2) DEFAULT 5.00,
    tax_amount     NUMERIC(12, 2),
    discount       NUMERIC(12, 2) DEFAULT 0,
    grand_total    NUMERIC(12, 2),
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid'
    paid_at        TIMESTAMPTZ,
    traveler_ids   UUID[]
);

-- Packing Checklists
CREATE TABLE packing_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id    UUID REFERENCES trips(id) ON DELETE CASCADE,
    category   VARCHAR(100), -- 'documents' | 'clothing' | 'electronics' | 'misc'
    item_name  VARCHAR(255) NOT NULL,
    is_packed  BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trip Notes / Journal
CREATE TABLE trip_notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id    UUID REFERENCES trips(id) ON DELETE CASCADE,
    section_id UUID REFERENCES trip_sections(id),
    day_number INTEGER,
    title      VARCHAR(255),
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community Posts (shared itineraries with social engagement)
CREATE TABLE community_posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID REFERENCES trips(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES users(id),
    caption     TEXT,
    view_count  INTEGER DEFAULT 0,
    copy_count  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_sections_trip_id ON trip_sections(trip_id);
CREATE INDEX idx_budget_items_trip_id ON budget_items(trip_id);
CREATE INDEX idx_packing_items_trip_id ON packing_items(trip_id);
CREATE INDEX idx_notes_trip_id ON trip_notes(trip_id);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_activities_city_id ON activities(city_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
```

---

## 7. Feature Specifications

---

### Screen 1 — Login Screen

**Purpose:** Authenticate returning users.

**Components:**
- Profile photo placeholder (branding / illustration)
- Username/Email field
- Password field (masked)
- Login button (primary CTA)
- Link: "Don't have an account? Register"
- Link: "Forgot Password?" (out of scope for hackathon — placeholder only)

**Behavior:**
- On submit: POST `/api/auth/login` with `{ email, password }`
- On success: store JWT in httpOnly cookie or localStorage; redirect to Dashboard (Screen 3)
- On failure: inline error "Invalid credentials" — do NOT differentiate between wrong email and wrong password (security)
- Validation: email format check, password minimum 6 characters, both client-side before submit

**Error States:**
- Empty fields → "Email and password are required"
- Invalid email format → "Enter a valid email address"
- Auth failure → "Incorrect email or password"
- Network failure → "Something went wrong. Try again."

---

### Screen 2 — Registration Screen

**Purpose:** Create a new user account.

**Components:**
- Profile photo upload (optional)
- First Name, Last Name (required)
- Email Address (required, unique)
- Phone Number (optional)
- City, Country (optional)
- Additional Information (bio text area, optional)
- Register button

**Behavior:**
- On submit: POST `/api/auth/register`
- On success: auto-login (issue JWT) and redirect to Dashboard
- Email uniqueness check happens server-side; surface as inline error if duplicate
- Photo upload: multipart form; store reference path in DB

**Validation Rules:**
- First Name, Last Name: required, 2–100 characters
- Email: required, valid format, unique
- Phone: optional, numeric, 7–15 digits
- Password (from screen 1 flow): min 8 chars, 1 uppercase, 1 number

---

### Screen 3 — Main Landing / Dashboard

**Purpose:** Central hub post-login. Surfaces relevant content and entry points.

**Components:**
- Top bar: Traveloop logo + user avatar (links to Profile)
- Banner Image (hero visual — static or rotating)
- Search bar with Group By / Filter / Sort By controls
- "Top Regional Selections" — horizontal scroll of city cards
- "Previous Trips" — cards of user's completed trips
- "+ Plan a trip" FAB (Floating Action Button)

**Behavior:**
- City cards in Top Regional Selections: fetched from `/api/cities?sort=popular&limit=8`
- Previous Trips: fetched from `/api/trips?status=completed&user_id=me&limit=3`
- Search bar: navigates to Activity/City Search (Screen 8) with query param pre-filled
- "Plan a trip" button navigates to Screen 4 (Create New Trip)
- Group By / Filter / Sort apply to the trip/city listings on this page

**Empty States:**
- No previous trips: "No trips yet. Start planning your first adventure." with CTA button

---

### Screen 4 — Create a New Trip

**Purpose:** Initialize a trip with basic metadata and get destination suggestions.

**Components:**
- Start Date (date picker)
- Select a Place (city search / autocomplete)
- End Date (date picker)
- Suggestion grid: 6 cards of "Places to Visit / Activities to Perform" based on selected city

**Behavior:**
- Place selection triggers `/api/cities/suggestions?city_id=X` to populate suggestion grid
- Suggestion cards are informational at this stage (user can tap to add to itinerary later)
- On save: POST `/api/trips` → creates trip record → navigates to Itinerary Builder (Screen 5) with the new trip ID
- Date validation: end_date must be ≥ start_date

**Data Flow:**
```
User selects city → fetch activity suggestions → user sets dates → submit → 
trip created in DB → redirect to /trips/:id/builder
```

---

### Screen 5 — Build Itinerary Screen

**Purpose:** Add and organize stops (sections) within the trip, each with a date range and budget.

**Components:**
- Section cards (repeating): title, description, date range, budget input
- "+ Add another Section" button
- Each section has: free-text description area, date range picker (xxx to yyy), budget field

**Behavior:**
- Sections map to `trip_sections` table entries
- Order of sections is user-controlled (drag-to-reorder optional for hackathon; sort_order field supports it)
- Budget field per section rolls up to trip-level total budget (computed, not stored separately)
- Each section's city is selectable via inline city search (links to Screen 8 flow)
- Auto-save on blur or explicit Save button

**API Calls:**
- POST `/api/trips/:tripId/sections` — create section
- PATCH `/api/trips/:tripId/sections/:sectionId` — update section
- DELETE `/api/trips/:tripId/sections/:sectionId` — remove section
- GET `/api/trips/:tripId/sections` — load all sections

---

### Screen 6 — User Trip Listing

**Purpose:** All trips belonging to the authenticated user, grouped by status.

**Components:**
- Search bar + Group By / Filter / Sort By
- Three groups: Ongoing, Upcoming, Completed
- Each trip card: trip name, destination count, date range, status badge, actions (view / edit / delete)

**Behavior:**
- Status computed server-side based on today's date vs. start_date/end_date:
  - `start_date > today` → Upcoming
  - `start_date ≤ today ≤ end_date` → Ongoing
  - `end_date < today` → Completed
- Delete: soft delete preferred (set `deleted_at` timestamp); hard delete on explicit confirmation
- Filter: by date range, destination
- Sort By: created date, start date, trip name

---

### Screen 7 — User Profile Page

**Purpose:** Display and edit user information; surface preplanned and past trips.

**Components:**
- User avatar (editable) + User Details block with inline edit
- "Preplanned Trips" grid — upcoming trips with View button
- "Previous Trips" grid — completed trips with View button

**Behavior:**
- PATCH `/api/users/me` for profile updates
- Photo upload: multipart; stored server-side
- View buttons navigate to Itinerary View (Screen 9) for the selected trip
- Preplanned = status 'planned' or 'ongoing'; Previous = status 'completed'

---

### Screen 8 — Activity / City Search

**Purpose:** Search for cities or activities to add to itinerary sections.

**Components:**
- Search bar (pre-fillable from Dashboard search)
- Group By / Filter / Sort By
- Results list: each result card shows option name + details (cost, category, duration for activities; country, region for cities)

**Behavior:**
- GET `/api/search?q=paragliding&type=activity` or `type=city`
- Results paginated: 10 per page, infinite scroll or pagination
- Each result has "Add to Section" action if accessed from within a trip planning flow (trip context passed via state/query param)
- If accessed standalone (from dashboard search): navigates to detail view

**Filter Options (Activities):**
- Category: adventure, food, culture, sightseeing, relaxation
- Max cost (range slider)
- Duration (< 2hrs, half day, full day)

**Filter Options (Cities):**
- Region / Country
- Cost index: budget, mid-range, luxury

---

### Screen 9 — Itinerary View with Budget

**Purpose:** Read-only (or lightly editable) structured view of the full trip plan day by day.

**Components:**
- Trip title + Search bar + Group By / Filter / Sort
- Day-by-day layout: Day 1, Day 2, etc.
- Each day: list of Physical Activities with corresponding Expense column
- Arrows/connectors between activities (visual flow)

**Behavior:**
- GET `/api/trips/:tripId/itinerary` — returns sections + activities organized by day
- Expenses shown per activity (from `section_activities.actual_cost` or `activities.avg_cost` as fallback)
- Day total computed client-side as sum of activity expenses for that day
- Trip total shown at bottom
- Edit mode (pencil icon) allows updating individual activity costs inline

---

### Screen 10 — Community Tab

**Purpose:** Social feed of public itineraries shared by users.

**Components:**
- Search bar + Group By / Filter / Sort By
- Feed: user avatar + post content card (trip summary)

**Behavior:**
- GET `/api/community/posts?page=1&limit=10`
- Each post links to a read-only public itinerary view
- "Copy Trip" action: clones the public trip into the current user's account as a new draft
- View count incremented server-side on post open (idempotent per session)
- Filter: by destination, trip duration, travel style

**Copy Trip Logic:**
```
POST /api/trips/copy/:publicSlug
→ Duplicates trip + sections + activities under requesting user's account
→ Status set to 'planned', is_public set to false
→ Redirect to new trip's builder
```

---

### Screen 11 — Packing Checklist

**Purpose:** Per-trip packing management with category grouping and progress tracking.

**Components:**
- Trip selector dropdown (select which trip's checklist to view)
- Progress bar: "X/Y items packed"
- Category groups: Documents, Clothing, Electronics (custom categories addable)
- Each item: checkbox, item name, delete icon
- Count badge per category (e.g., "3/4")
- "+ Add item to checklist" button
- "Reset All" button (uncheck all without deleting)
- "Share Checklist" button (copy plaintext or share link)

**Behavior:**
- PATCH `/api/trips/:tripId/checklist/:itemId` with `{ is_packed: true/false }`
- POST `/api/trips/:tripId/checklist` — add item
- DELETE `/api/trips/:tripId/checklist/:itemId` — remove item
- Progress: computed as count of `is_packed=true` / total items
- Share: generates a read-only view or plain text export of the list
- Default items auto-populated on trip creation based on a template (configurable)

**Default Template (Documents):**
- Passport, Flight Tickets (printed), Travel Insurance, Hotel Booking Confirmation

**Default Template (Electronics):**
- Phone Charger, Universal Power Adapter, Earphones/Headphones

---

### Screen 12 — Admin Panel

**Purpose:** Platform monitoring and user management for admin-role users only.

**Components:**
- Top tabs: Manage Users / Popular Cities / Popular Activities / User Trends & Analytics
- Charts section: pie chart, line graph, bar chart
- Descriptions panel (right sidebar) explaining each tab

**Tab Specifications:**

**Manage Users:**
- Table: user list with name, email, join date, trip count, role
- Actions: view profile, deactivate/activate, change role

**Popular Cities:**
- List of cities ranked by trip_sections count in last 30/90/365 days
- Filterable by time range

**Popular Activities:**
- List of activities ranked by section_activities count
- Filterable by city, category, time range

**User Trends & Analytics:**
- Line graph: new users over time
- Bar chart: trips created per week/month
- Pie chart: trips by status (planned / ongoing / completed)
- Summary stats: total users, total trips, avg trips per user, most popular city

**Access Control:**
- Middleware: `requireRole('admin')` on all `/api/admin/*` routes
- Non-admin users who navigate to `/admin` are redirected to dashboard with 403

---

### Screen 13 — Trip Notes / Journal

**Purpose:** Freeform notes tied to a trip, filterable by day or stop.

**Components:**
- Trip selector dropdown
- "+ Add Note" button
- Filter tabs: All / By Day / By Stop
- Note cards: title, content preview, day label, timestamp, edit icon, delete icon

**Behavior:**
- POST `/api/trips/:tripId/notes` — create note
- PATCH `/api/trips/:tripId/notes/:noteId` — update note
- DELETE `/api/trips/:tripId/notes/:noteId` — delete note
- Notes are sortable by created_at (default: newest first)
- Edit opens inline editor or modal with full content
- By Day filter: shows only notes tagged to a specific day number
- By Stop filter: shows only notes tagged to a specific section/city

---

### Screen 14 — Expense Invoice / Billing Screen

**Purpose:** Structured invoice view for a trip with export capability.

**Components:**
- Trip header: cover photo, trip name, dates, city count, created by
- Invoice metadata: Invoice ID, generated date, traveler names list, payment status
- Budget Insights (right panel): donut chart, total budget, total spent, remaining (can be negative)
- "View Full Budget" link
- Line item table: # / Category / Description / Qty+Details / Unit Cost / Amount
- Footer totals: Subtotal, Tax (5%), Discount, Grand Total
- Actions: Download Invoice, Export as PDF, Mark as Paid

**Behavior:**
- GET `/api/trips/:tripId/invoice` — computes invoice from budget_items
- Grand Total = Subtotal + Tax - Discount
- Tax rate is configurable (default 5%)
- "Mark as Paid": PATCH `/api/invoices/:invoiceId` with `{ payment_status: 'paid' }`
- Export as PDF: server-side rendering of invoice to PDF using pdfkit / puppeteer; returned as file download
- Invoice number format: `INV-{YEAR}-{RANDOM_5_DIGITS}` e.g. `INV-2025-30290`

**Budget Insights Logic:**
- Total Budget: `trips.total_budget`
- Total Spent: `SUM(budget_items.amount)` for this trip
- Remaining: Total Budget - Total Spent (negative = over budget, shown in red)

---

## 8. API Contract

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Get current user |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get own profile |
| PATCH | `/api/users/me` | Update profile |
| POST | `/api/users/me/photo` | Upload profile photo |

### Trips

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips` | List user's trips (filterable by status) |
| POST | `/api/trips` | Create trip |
| GET | `/api/trips/:id` | Get trip detail |
| PATCH | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Soft delete trip |
| GET | `/api/trips/:id/itinerary` | Full itinerary with activities |
| GET | `/api/trips/:id/invoice` | Computed invoice |
| POST | `/api/trips/copy/:slug` | Copy public trip |

### Sections

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/:tripId/sections` | List sections |
| POST | `/api/trips/:tripId/sections` | Create section |
| PATCH | `/api/trips/:tripId/sections/:id` | Update section |
| DELETE | `/api/trips/:tripId/sections/:id` | Delete section |

### Cities & Activities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cities` | List/search cities |
| GET | `/api/cities/:id` | City detail |
| GET | `/api/cities/:id/suggestions` | Activity suggestions for city |
| GET | `/api/activities` | List/search activities |

### Checklists

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/:tripId/checklist` | Get full checklist |
| POST | `/api/trips/:tripId/checklist` | Add item |
| PATCH | `/api/trips/:tripId/checklist/:itemId` | Update item (toggle packed) |
| DELETE | `/api/trips/:tripId/checklist/:itemId` | Delete item |
| POST | `/api/trips/:tripId/checklist/reset` | Uncheck all |

### Notes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/trips/:tripId/notes` | List notes |
| POST | `/api/trips/:tripId/notes` | Create note |
| PATCH | `/api/trips/:tripId/notes/:noteId` | Update note |
| DELETE | `/api/trips/:tripId/notes/:noteId` | Delete note |

### Community

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/community/posts` | Paginated public feed |
| GET | `/api/community/:slug` | Public trip by slug |
| POST | `/api/trips/:tripId/publish` | Make trip public |
| POST | `/api/trips/:tripId/unpublish` | Make trip private |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | All users list |
| PATCH | `/api/admin/users/:id` | Update user role/status |
| GET | `/api/admin/analytics` | Platform analytics payload |
| GET | `/api/admin/popular-cities` | Top cities by trip count |
| GET | `/api/admin/popular-activities` | Top activities by usage |

### Standard Response Envelope

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 128
  }
}
```

### Standard Error Response

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is already registered.",
    "field": "email"
  }
}
```

---

## 9. Non-Functional Requirements

### Performance
- Dashboard load: < 2 seconds on a standard broadband connection
- Search results (cities/activities): < 500ms response time
- Invoice PDF generation: < 5 seconds

### Security
- All routes except `/api/auth/*` and `/api/community/:slug` require valid JWT
- Admin routes require role check in addition to JWT
- Passwords stored with bcrypt (min 12 rounds)
- All user-provided strings sanitized before DB insertion (prevent SQL injection and XSS)
- File uploads: validate MIME type and size (max 5MB per photo)
- Rate limiting on auth endpoints: max 10 attempts per IP per 15 minutes

### Data Integrity
- Cascade deletes: deleting a trip removes all sections, activities, budget items, notes, checklist items
- Soft delete on trips (`deleted_at` column) — recoverable within 30 days
- Invoice numbers must be unique across the system

### Accessibility
- All interactive elements keyboard-navigable
- Form fields have associated `<label>` elements
- Color contrast meets WCAG AA minimum

### Browser Support
- Chrome, Firefox, Safari, Edge — last 2 major versions
- Mobile-responsive (wireframes show mobile-first layout)

---

## 10. Constraints & Assumptions

### Constraints
- Hackathon time constraint: all core screens must be functional by demo time
- Must use a relational database (PostgreSQL specified)
- No third-party booking integrations in scope (flights, hotels are tracked as manual entries only)
- No payment processing — "Mark as Paid" is a status flag only

### Assumptions
- Cities and Activities are seeded in the database (not user-generated) — admin can add via admin panel
- Currency is single-currency per trip (no FX conversion)
- "Real-time" collaboration cursors visible in wireframes are display-only indicators for hackathon; no operational real-time sync required
- Profile photos and trip cover photos stored server-side in local filesystem for hackathon; cloud storage assumed for production
- The "Forgot Password" flow is a placeholder — not required for hackathon delivery
- Community feed shows all public trips globally (no follow/friend graph in v1)

---

## 11. Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| 1 | Will multi-currency support be required post-hackathon? If yes, FX rates need a third-party integration (e.g., Fixer.io) | Product | High |
| 2 | Should the "Copy Trip" feature preserve original author attribution or strip it? | Product | Medium |
| 3 | Default packing list templates — are these per destination type (beach trip vs. city trip) or universal? | UX | Medium |
| 4 | Trip sharing: can a non-registered user view a public itinerary? Or is login required? | Product | High |
| 5 | Activity catalog — who seeds and maintains it? Admin only or can users suggest activities? | Product | High |
| 6 | Invoice discount field — is it manual entry or auto-calculated from a promo system? | Product | Low |
| 7 | Are "Preplanned Trips" on the profile page the same as status=planned trips, or a separate user-bookmarked concept? | UX | Medium |
| 8 | Should notes be exportable (e.g., as part of the PDF invoice or separately)? | Product | Low |

---

## 12. Out of Scope

The following are explicitly excluded from v1 / hackathon build:

- Flight and hotel booking integrations
- Payment processing (Stripe, Razorpay, etc.)
- Multi-currency with real-time FX conversion
- Push / email notifications
- Mobile native apps (iOS / Android)
- Offline mode / PWA caching
- Social interactions on community posts (likes, comments, follows)
- AI-generated itinerary suggestions
- Map view of trip route
- Calendar sync (Google Calendar, iCal export)
- Forgot Password / Password Reset email flow
- Two-factor authentication

These should be documented as the v2 backlog.

---

## 13. Milestones & Delivery Plan

### Phase 1 — Foundation (Day 1 AM)
- Project scaffolding (frontend + backend repos, DB connection)
- Database schema creation and seed data (cities, activities)
- Auth flow: Login + Register (Screens 1 & 2) fully functional

### Phase 2 — Core Trip Flow (Day 1 PM)
- Dashboard (Screen 3)
- Create Trip (Screen 4)
- Itinerary Builder (Screen 5)
- Trip Listing (Screen 6)

### Phase 3 — Supporting Features (Day 2 AM)
- Itinerary View with Budget (Screen 9)
- Activity / City Search (Screen 8)
- User Profile (Screen 7)
- Packing Checklist (Screen 11)

### Phase 4 — Extended Features (Day 2 PM)
- Trip Notes / Journal (Screen 13)
- Expense Invoice (Screen 14)
- Community Tab (Screen 10)
- Admin Panel (Screen 12)

### Phase 5 — Polish & Demo Prep
- Error states on all screens
- Empty states on all screens
- Seed realistic demo data (2–3 pre-built trips with full itineraries)
- End-to-end smoke test of all 14 screens
- PDF export working for invoice

---

*This document should be treated as a living artifact. Any scope changes, technical decisions, or resolved open questions must be reflected here before implementation begins on the affected feature.*
