# Plan 2 — Auth Module

> **For agentic workers:** Use superpowers:subagent-driven-development to implement task-by-task.

**Goal:** Complete authentication system — login, register, session management, JWT middleware  
**Architecture:** Express routes → auth service → Prisma user model → bcrypt + JWT  
**Tech Stack:** Express 5, TypeScript, Prisma 6, bcryptjs, jsonwebtoken  
**PRD Sections:** §7 Screens 1-2, §8 Auth, §9 Security  
**Agent:** Sonnet (backend), Gemini (frontend screens)  

---

## Epic: Authentication System

### Feature 1: User Registration (Screen 2)

**API:** `POST /api/auth/register`  
**DB:** `users` table  
**Screens:** Registration form  

#### Task 1.1: Prisma User Model
- **Files:** `apps/api/prisma/schema.prisma`
- **Duration:** 3 min
- **Acceptance:** `npx prisma validate` passes with users table matching PRD §6 exactly
- **Details:** UUID PK, first_name, last_name, email (unique), phone, city, country, password_hash, profile_photo, bio, role (default 'user'), created_at, updated_at

#### Task 1.2: Register Endpoint — Failing Test
- **Files:** `apps/api/src/modules/auth/auth.test.ts`
- **Duration:** 3 min
- **Acceptance:** Test fails with "register function not defined"
- **Test:** POST /api/auth/register with valid body → expects 201 + JWT cookie + user object (no password_hash)

#### Task 1.3: Register Endpoint — Implementation
- **Files:** `apps/api/src/modules/auth/auth.controller.ts`, `auth.service.ts`, `auth.routes.ts`
- **Duration:** 5 min
- **Acceptance:** Test from 1.2 turns GREEN
- **Logic:** Validate input → check email uniqueness → bcrypt hash (12 rounds) → Prisma create → sign JWT → set httpOnly cookie → return user (exclude password_hash)

#### Task 1.4: Register Validation — Failing Tests
- **Files:** `apps/api/src/modules/auth/auth.test.ts`
- **Duration:** 3 min
- **Acceptance:** Tests fail for correct reason
- **Tests:**
  - Missing first_name → 400 "First name is required"
  - Invalid email format → 400 "Enter a valid email address"
  - Duplicate email → 409 "Email is already registered"
  - Password < 8 chars → 400 "Password must be at least 8 characters"
  - Password no uppercase → 400 "Password must contain at least one uppercase letter"
  - Password no number → 400 "Password must contain at least one number"

#### Task 1.5: Register Validation — Implementation
- **Files:** `apps/api/src/modules/auth/auth.service.ts`
- **Duration:** 3 min
- **Acceptance:** All validation tests GREEN

#### Task 1.6: Profile Photo Upload
- **Files:** `apps/api/src/modules/auth/auth.controller.ts`
- **Duration:** 3 min
- **Acceptance:** Multipart form upload stores file locally, path saved in DB
- **Constraints:** MIME validation (image/*), max 5MB per PRD §9

---

### Feature 2: User Login (Screen 1)

**API:** `POST /api/auth/login`  

#### Task 2.1: Login Endpoint — Failing Test
- **Files:** `apps/api/src/modules/auth/auth.test.ts`
- **Duration:** 2 min
- **Acceptance:** Test fails correctly
- **Test:** POST /api/auth/login with valid credentials → expects 200 + JWT cookie

#### Task 2.2: Login Endpoint — Implementation
- **Files:** `apps/api/src/modules/auth/auth.controller.ts`, `auth.service.ts`
- **Duration:** 3 min
- **Acceptance:** Login test GREEN
- **Logic:** Find user by email → bcrypt compare → sign JWT → set httpOnly cookie
- **Error:** "Incorrect email or password" — never differentiate wrong email vs wrong password (PRD §7 Screen 1)

#### Task 2.3: Login Error States — Tests + Implementation
- **Files:** `apps/api/src/modules/auth/auth.test.ts`, `auth.service.ts`
- **Duration:** 3 min
- **Tests:**
  - Empty fields → 400 "Email and password are required"
  - Invalid email format → 400 "Enter a valid email address"
  - Wrong credentials → 401 "Incorrect email or password"

---

### Feature 3: Session Management

#### Task 3.1: JWT Middleware — Failing Test
- **Files:** `apps/api/src/middleware/auth.middleware.test.ts`
- **Duration:** 3 min
- **Test:** Request without JWT → 401; Request with valid JWT → next() called with req.user populated

#### Task 3.2: JWT Middleware — Implementation
- **Files:** `apps/api/src/middleware/auth.middleware.ts`
- **Duration:** 3 min
- **Logic:** Extract JWT from httpOnly cookie → verify → attach user to req → next()

#### Task 3.3: GET /api/auth/me — Test + Implementation
- **Files:** `apps/api/src/modules/auth/auth.test.ts`, `auth.controller.ts`
- **Duration:** 3 min
- **Acceptance:** Returns current user from JWT; 401 if no token

#### Task 3.4: POST /api/auth/logout — Test + Implementation
- **Files:** `apps/api/src/modules/auth/auth.test.ts`, `auth.controller.ts`
- **Duration:** 2 min
- **Logic:** Clear httpOnly cookie

#### Task 3.5: Rate Limiter — Test + Implementation
- **Files:** `apps/api/src/middleware/rate-limiter.ts`, `rate-limiter.test.ts`
- **Duration:** 3 min
- **Acceptance:** 10 requests per IP per 15 minutes on /api/auth/* routes; 429 after limit

#### Task 3.6: Role Guard Middleware — Test + Implementation
- **Files:** `apps/api/src/middleware/role-guard.ts`, `role-guard.test.ts`
- **Duration:** 3 min
- **Acceptance:** `requireRole('admin')` blocks non-admin with 403; allows admin

---

### Feature 4: Auth Frontend (Gemini)

#### Task 4.1: Login Page Component
- **Files:** `apps/web/src/pages/Login.tsx`, `Login.test.tsx`
- **Duration:** 5 min
- **Acceptance:** Email + password fields, login button, register link, forgot password placeholder
- **Validation:** Email format, password min 6 chars (client-side)
- **Error states:** All 4 from PRD §7 Screen 1

#### Task 4.2: Register Page Component
- **Files:** `apps/web/src/pages/Register.tsx`, `Register.test.tsx`
- **Duration:** 5 min
- **Acceptance:** All fields from PRD §7 Screen 2, photo upload, validation rules
- **Validation:** Per PRD §7 Screen 2 validation rules

#### Task 4.3: Auth Context + Protected Routes
- **Files:** `apps/web/src/lib/auth-context.tsx`, `apps/web/src/lib/api-client.ts`
- **Duration:** 4 min
- **Acceptance:** AuthProvider wraps app, useAuth hook, ProtectedRoute component redirects to /login if no session

---

## Dependency Map

```
Task 1.1 (Prisma schema) → blocks ALL other auth tasks
Task 1.2-1.6 (Register) → blocks Task 2.x (Login needs a user)
Task 3.1-3.2 (JWT middleware) → blocks ALL protected routes in other modules
Task 3.6 (Role guard) → blocks Admin module
Task 4.3 (Auth context) → blocks ALL frontend screens
```

**Total tasks:** 18 | **Estimated time:** ~55 min backend, ~15 min frontend
