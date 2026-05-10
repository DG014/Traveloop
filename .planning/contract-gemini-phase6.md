# Contract: Gemini — Phase 6 Frontend Integration & Polish

**Agent:** Gemini  
**Phase:** 6 — Integration Polish  
**Scope:** `apps/web/` only — DO NOT touch `apps/api/`  
**Dev Server:** `npm run dev` → port 5173  
**Backend:** Running on port 3001 (Sonnet manages)  
**Design System:** `design-system/MASTER.md` — Royal Blue primary, Inter font  

---

## SESSION START PROTOCOL

1. Read `PROJECT_MEMORY.md` — §3 for API contracts, §7 for change log
2. Read `design-system/MASTER.md` for styling tokens
3. Run `cd apps/web && npm run dev` — verify Vite starts clean
4. Open browser at localhost:5173, verify login works
5. Execute tasks in order below

---

## Tasks

### G6-1: Fix Invoice PDF URL ⚡ HIGH (5 min)

**File:** `apps/web/src/pages/InvoiceView.tsx`  
**Line:** 48  

**Current (broken):**
```typescript
window.open(`http://localhost:3000/api/trips/${tripId}/invoice/pdf`, '_blank');
```

**Fix:**
```typescript
window.open(`/api/trips/${tripId}/invoice/pdf`, '_blank');
```

**Why:** Vite proxy handles `/api/*` → `localhost:3001`. Hardcoded port was wrong (3000 vs 3001) AND won't work in production.

---

### G6-2: Add Publish/Unpublish Trip Flow ⚡ HIGH

**Files:** `apps/web/src/pages/ItineraryView.tsx` (header area)  

**What:** Users need a way to publish trips to the community feed  

**API Contracts (already implemented by Sonnet in Phase 4):**
```
POST /api/trips/:id/publish   → { data: { publicSlug: "xyz123" } }
POST /api/trips/:id/unpublish → { data: { message: "Trip unpublished" } }
```

**UI Requirements:**
1. In the trip header area of ItineraryView, add a publish toggle/button
2. If `trip.isPublic === false`: Show "📤 Publish to Community" button (primary style)
3. If `trip.isPublic === true`: Show:
   - "Published ✓" green badge
   - Copy link button: copies `/community/${trip.publicSlug}` to clipboard
   - "Unpublish" text button (destructive style)
4. After publish: show toast/alert with shareable link

**Styling:** Match existing button styles in the header. Use primary color for publish, green for published state, muted for unpublish.

---

### G6-3: Wire Community Page to AppLayout for Logged-in Users ⚡ MEDIUM

**Files:** `apps/web/src/App.tsx`, new `apps/web/src/components/ConditionalLayout.tsx`

**Problem:** `/community` is outside `<ProtectedRoute>` so logged-in users lose the sidebar  

**Solution — Create ConditionalLayout:**
```tsx
// apps/web/src/components/ConditionalLayout.tsx
import { useAuth } from '../lib/auth-context';
import { AppLayout } from './AppLayout';
import { Outlet } from 'react-router-dom';

export function ConditionalLayout() {
  const { user } = useAuth();
  // If logged in, show AppLayout with sidebar
  // If not logged in, just render the page standalone
  return user ? <AppLayout /> : <Outlet />;
}
```

**Update App.tsx:**
```tsx
// Wrap community routes in ConditionalLayout
<Route element={<ConditionalLayout />}>
  <Route path="/community" element={<CommunityFeed />} />
  <Route path="/community/:slug" element={<PublicTripView />} />
</Route>
```

**Also fix CommunityFeed.tsx:** Change "← Dashboard" link behavior:
- If logged in: link to `/` (Dashboard)
- If not logged in: hide the link or link to `/login`

---

### G6-4: Search/Filter/Sort UI on TripListing ⚡ MEDIUM

**File:** `apps/web/src/pages/TripListing.tsx`  
**PRD:** Screen 6 requires Search bar + Group By / Filter / Sort By  

**Requirements:**
1. Add a filter bar above the trip cards:
   - Status filter: All | Planned | Ongoing | Completed (pill buttons)
   - Sort dropdown: Newest | Oldest | Name A-Z | Name Z-A
   - Search input: filter by trip title (client-side)
2. Apply filters to the existing trip list (already fetched from API)
3. Maintain the 3-group layout (Ongoing/Upcoming/Completed) from PRD

**Styling:** Use the existing `SearchBar` component design patterns. Pill buttons for status filter. Match slate color palette.

---

### G6-5: Wire Admin Panel to Real API Data ⚡ MEDIUM

**File:** `apps/web/src/pages/AdminPanel.tsx`  
**Depends on:** Sonnet S6-2 (admin analytics API)

**What:** Replace mock chart data with real API fetches

**API Calls to Wire:**
```
GET /api/admin/stats   → summary cards (total users, trips, etc.)
GET /api/admin/trends  → chart data (time series)
GET /api/admin/users   → user management table
```

**Chart Mapping:**
- PieChart → `trends.tripsByStatus` (planned/ongoing/completed)
- LineChart → `trends.newUsersOverTime` (date vs count)
- BarChart → `trends.tripsPerMonth` (month vs count)
- Summary cards → `stats.totalUsers`, `stats.totalTrips`, etc.

**Note:** If Sonnet hasn't delivered S6-2 yet, keep the mock data as fallback with a try/catch.

---

### G6-6: Fix Community Feed Blank Cards ⚡ MEDIUM

**File:** `apps/web/src/pages/CommunityFeed.tsx`

**Problem:** Cards appear blank when Unsplash images fail to load

**Fix:**
1. Add `onError` handler to cover photo `<img>`:
```tsx
<img
  src={post.trip.coverPhoto}
  alt={post.trip.title}
  onError={(e) => {
    (e.target as HTMLImageElement).style.display = 'none';
    (e.target as HTMLImageElement).parentElement!.classList.add('bg-gradient-to-br', 'from-blue-400', 'to-indigo-600');
  }}
  className="w-full h-full object-cover ..."
/>
```

2. Remove the `source.unsplash.com` fallback (it's unreliable):
```tsx
// Replace the else branch with a gradient fallback
) : (
  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500" />
)}
```

3. Ensure the text overlay (title, author, stats) has enough contrast against both image and gradient backgrounds

---

## Verification Checklist

```bash
# Run ALL before claiming COMPLETE
cd apps/web
npx tsc --noEmit       # 0 TypeScript errors
npm run build           # Vite build succeeds

# Manual browser checks:
# 1. Login as admin@traveloop.com / Admin@1234
# 2. Dashboard loads with content
# 3. /trips shows filter/sort controls
# 4. Click a trip → see Publish button
# 5. /community shows sidebar when logged in
# 6. /admin shows real chart data
# 7. /trips/:id/invoice → Export PDF works
```

## On Completion

Add entry to `PROJECT_MEMORY.md §7`:
```
[Gemini | <timestamp> | COMPLETE] Phase 6 frontend: Publish flow, community fix, search/filter, admin charts, PDF URL fix done.
```
