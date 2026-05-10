# Plan 2 — Budget/Invoice Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Budget line items, invoice generation, PDF export, payment status  
**PRD:** §7 Screen 14, §8 Trips (invoice)  
**Agent:** Sonnet (backend), GPT (PDF template), Gemini (frontend)  

---

## Tasks

### Task 1: Budget Items CRUD API (Sonnet)
- POST/GET/PATCH/DELETE for budget_items
- Fields: trip_id, section_id, category, description, qty, unit_cost
- Amount = qty × unit_cost (computed/stored column)
- Categories: hotel, travel, food, activity, misc

### Task 2: Invoice Computation API (Sonnet)
- GET /api/trips/:tripId/invoice
- Computes from budget_items: subtotal, tax (5% default), discount, grand_total
- Invoice number format: INV-{YEAR}-{RANDOM_5_DIGITS}
- Auto-creates invoice record if not exists

### Task 3: Invoice Status API (Sonnet)
- PATCH /api/invoices/:invoiceId — update payment_status to 'paid', set paid_at
- GET returns traveler_ids array

### Task 4: Invoice PDF Generation (GPT + Sonnet)
- GPT: Puppeteer HTML template matching PRD §7 Screen 14 layout
- Sonnet: GET /api/trips/:tripId/invoice/pdf — renders template → returns file download
- Constraint: < 5 seconds generation time

### Task 5: Expense Invoice Page — Screen 14 (Gemini)
- Trip header: cover photo, name, dates, city count, created by
- Invoice metadata: ID, date, travelers, payment status
- Budget Insights panel: donut chart (Chart.js), total budget, spent, remaining
- Line item table: #, category, description, qty+details, unit cost, amount
- Footer: subtotal, tax, discount, grand total
- Actions: Download Invoice, Export PDF, Mark as Paid
- Remaining negative = over budget → shown in red

**Dependencies:** Auth → Trip → this module  
**Total:** 5 grouped tasks | ~40 min
