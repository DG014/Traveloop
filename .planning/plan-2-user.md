# Plan 2 — User Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** User profile CRUD — view, edit, photo management  
**Architecture:** Express routes → user service → Prisma user model  
**Tech Stack:** Express 5, TypeScript, Prisma 6, multer (file upload)  
**PRD Sections:** §7 Screen 7, §8 Users  
**Agent:** Sonnet (backend), Gemini (frontend)  

---

## Epic: User Profile Management

### Feature 1: Profile API

#### Task 1.1: GET /api/users/me — Failing Test
- **Files:** `apps/api/src/modules/user/user.test.ts`
- **Duration:** 2 min
- **Test:** Authenticated request → 200 + full user object (exclude password_hash)

#### Task 1.2: GET /api/users/me — Implementation
- **Files:** `apps/api/src/modules/user/user.controller.ts`, `user.service.ts`, `user.routes.ts`
- **Duration:** 3 min
- **Acceptance:** Returns user from JWT payload, fetches full record from DB

#### Task 1.3: PATCH /api/users/me — Failing Test
- **Files:** `apps/api/src/modules/user/user.test.ts`
- **Duration:** 2 min
- **Tests:**
  - Update first_name → 200 + updated user
  - Update email to existing email → 409 "Email already in use"
  - Update with invalid phone → 400

#### Task 1.4: PATCH /api/users/me — Implementation
- **Files:** `apps/api/src/modules/user/user.service.ts`
- **Duration:** 3 min
- **Logic:** Validate fields → check email uniqueness if changed → Prisma update → return updated user

#### Task 1.5: POST /api/users/me/photo — Failing Test + Implementation
- **Files:** `apps/api/src/modules/user/user.test.ts`, `user.controller.ts`
- **Duration:** 3 min
- **Acceptance:** Multipart upload → store in `uploads/avatars/` → update profile_photo path
- **Constraints:** image/* MIME only, max 5MB

---

### Feature 2: Profile Frontend (Gemini)

#### Task 2.1: User Profile Page Component
- **Files:** `apps/web/src/pages/UserProfile.tsx`, `UserProfile.test.tsx`
- **Duration:** 5 min
- **Acceptance:** Per PRD §7 Screen 7:
  - User avatar (editable) + details block with inline edit
  - "Preplanned Trips" grid (status planned/ongoing) with View button
  - "Previous Trips" grid (status completed) with View button
- **API calls:** GET /api/users/me, GET /api/trips?status=planned,ongoing, GET /api/trips?status=completed

#### Task 2.2: Profile Edit Mode
- **Files:** `apps/web/src/pages/UserProfile.tsx`
- **Duration:** 3 min
- **Acceptance:** Inline edit toggles, PATCH on save, photo upload via file input

---

## Dependency Map

```
Auth module Task 3.2 (JWT middleware) → blocks ALL user tasks
Task 1.1-1.5 (API) → blocks Task 2.x (frontend needs API)
```

**Total tasks:** 7 | **Estimated time:** ~20 min backend, ~10 min frontend
