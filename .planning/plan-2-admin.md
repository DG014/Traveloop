# Plan 2 — Admin Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Admin panel — user management, analytics, popular cities/activities  
**PRD:** §7 Screen 12, §8 Admin  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Tasks

### Task 1: Admin User Management API (Sonnet)
- GET /api/admin/users — all users with name, email, join date, trip count, role
- PATCH /api/admin/users/:id — update role (user/admin), activate/deactivate
- All routes: requireRole('admin') middleware
- Non-admin navigating to /admin → 403 redirect

### Task 2: Admin Analytics API (Sonnet)
- GET /api/admin/analytics — payload includes:
  - New users over time (line graph data)
  - Trips created per week/month (bar chart data)
  - Trips by status: planned/ongoing/completed (pie chart data)
  - Summary: total users, total trips, avg trips/user, most popular city
- GET /api/admin/popular-cities — ranked by trip_sections count, filterable by 30/90/365 days
- GET /api/admin/popular-activities — ranked by section_activities count, filterable by city/category/time

### Task 3: Admin Panel Page — Screen 12 (Gemini)
- Top tabs: Manage Users / Popular Cities / Popular Activities / User Trends & Analytics
- Manage Users: table with actions (view, deactivate, change role)
- Popular Cities: ranked list, time range filter
- Popular Activities: ranked list, city/category/time filter
- Analytics: line graph (Chart.js), bar chart, pie chart
- Descriptions panel (right sidebar)

**Dependencies:** Auth (role guard) → this module  
**Total:** 3 grouped tasks | ~30 min
