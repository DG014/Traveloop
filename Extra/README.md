# TRAVELOOP — MASTER GUIDE
## How to Use These Parts · Build Order · Agent Instructions

---

## WHAT YOU HAVE

8 instruction files to build **Traveloop** — a premium collaborative travel SaaS frontend.
Each file is a self-contained prompt to paste into Claude (or any capable code-gen AI)
to build one "slice" of the app, then paste the next slice to continue.

---

## BUILD ORDER (mandatory — do not skip or reorder)

| Part | File | What Gets Built | Pages |
|---|---|---|---|
| 00 | `PART-00-FOUNDATION.md` | Design system · Tokens · Mock data · App shell · Router · All page stubs | All 13 (stubs) |
| 01 | `PART-01-LANDING-PAGE.md` | Full Landing page — Hero, bento, pricing, footer | Landing |
| 02 | `PART-02-AUTH-PAGE.md` | Login + 3-step Signup Wizard | Auth |
| 03 | `PART-03-DASHBOARD.md` | Post-login home — stats, trips, timeline, charts | Dashboard |
| 04 | `PART-04-TRIP-CREATION.md` | 4-step Trip Creation Wizard | Trip Create |
| 05 | `PART-05-ITINERARY.md` | Three-panel Itinerary Builder + Timeline/Gantt view | Itinerary Builder + Timeline |
| 06 | `PART-06-DISCOVERY-BUDGET-PACKING.md` | Destination Discovery + Budget Analytics + Packing | Discovery, Budget, Packing |
| 07 | `PART-07-JOURNAL-COLLAB-PROFILE-ADMIN.md` | Journal + Collaborate + Profile/Settings + Admin | Journal, Collaborate, Profile, Admin |

---

## HOW TO USE EACH PART

### Step 1 — Start a new Claude conversation

Open claude.ai in a new chat.

### Step 2 — Paste PART-00 first

Copy the entire contents of `PART-00-FOUNDATION.md` and paste it as your first message.

Wait for Claude to generate the complete scaffold artifact (the `.jsx` React app with
design tokens, mock data, all page stubs, router, sidebar, topnav, and toast system).

Verify:
- App renders without errors
- All 13 page names are navigable from the sidebar
- Design tokens are visible (deep navy bg, Playfair Display headings)

### Step 3 — Continue with PART-01

In the **same conversation**, paste `PART-01-LANDING-PAGE.md`.

Claude will update only `LandingPage` in the artifact. The rest of the app remains intact.

Verify:
- Hero gradient animation runs
- Floating cards visible and floating
- Pricing toggle works
- "Start Planning Free" routes to the Auth page

### Step 4 — Continue sequentially

Paste each subsequent part in the same conversation.
Claude keeps the full artifact in context and replaces only the relevant page component.

---

## TROUBLESHOOTING

**"Claude lost context / rewrote the whole artifact"**
If Claude starts from scratch instead of updating the existing artifact, remind it:
> "This is a continuation. The artifact already exists. Only replace the [PageName] component.
> Do not modify the app shell, router, mock data, or any other page."

**"Page X isn't rendering"**
Check that the page name in the router matches exactly (case-sensitive).
E.g. `"itineraryBuilder"` not `"ItineraryBuilder"`.

**"Recharts is not rendering"**
Make sure the `import` at the top includes all used components:
```js
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area,
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
         ReferenceLine } from "recharts";
```

**"Tailwind classes aren't working"**
The artifact uses Tailwind via CDN (pre-compiled classes only). No JIT.
Avoid dynamic class names like `bg-${color}-500` — use inline styles for dynamic values.

**"Fonts not loading"**
The `<style>` block in Part 00 includes a Google Fonts `@import`. If fonts don't appear,
check if the environment blocks external font requests.
Fallback: add `sans-serif` as fallback to all font-family declarations.

---

## DESIGN SYSTEM REFERENCE (quick lookup)

```
Colors:
  Base background:  #0a0f1e
  Primary accent:   #6366f1 (indigo)
  Secondary accent: #f59e0b (amber)
  Text primary:     rgba(255,255,255,0.92)
  Text muted:       rgba(255,255,255,0.5)
  Border:           rgba(255,255,255,0.1)

Glass surface:
  background:       rgba(255,255,255,0.05)
  border:           1px solid rgba(255,255,255,0.1)
  box-shadow:       0 8px 32px rgba(0,0,0,0.4)
  backdrop-filter:  blur(20px)

Fonts:
  Headings:  Playfair Display (700, 800)
  Body/UI:   DM Sans (400, 500, 600)

Keyframes defined in Part 00:
  fadeInUp · float · shimmer · gradientShift · shake · checkBounce · pulse-ring

Category colors (activities):
  Flight:     #6366f1 (indigo)
  Hotel:      #8b5cf6 (violet)
  Food:       #f59e0b (amber)
  Activity:   #10b981 (emerald)
  Transport:  #3b82f6 (blue)
  Free Time:  #6b7280 (gray)
```

---

## PAGE NAVIGATION MAP

```
Landing Page  ──[Start Planning Free]──►  Auth Page
                                              │
                                    [Create Account / Login]
                                              │
                                              ▼
                                        Dashboard
                                       ╱    │    ╲
                         [Active Trips]  [Budget→]  [Journal→]
                              │
                    Itinerary Builder ──[Timeline→]── Timeline View
                              │
                    Trip Creation Wizard (4 steps)

Sidebar navigation (all authenticated pages):
  Dashboard · My Trips · Discover · Budget · Journal · Collaborate · Settings · Admin
```

---

## FINAL QUALITY CHECKLIST

Before calling the build complete, verify each item:

### Navigation
- [ ] All 13 pages reachable from sidebar / nav
- [ ] Landing page CTA → Auth page
- [ ] Auth signup success → Dashboard
- [ ] Trip creation success → Itinerary Builder
- [ ] All "View All →" links navigate correctly

### Design
- [ ] Deep navy background everywhere
- [ ] Playfair Display on all headings
- [ ] DM Sans on all body text
- [ ] Indigo + amber accents consistent
- [ ] All cards glassmorphism (no plain white/gray surfaces)
- [ ] Hover states on all interactive elements

### Animations
- [ ] Hero gradient shifts
- [ ] Floating cards animate
- [ ] Stat count-up on Dashboard mount
- [ ] Recharts animate on entry
- [ ] Packing ring animates from 0 on mount
- [ ] Stagger fadeInUp on card grids

### Functionality
- [ ] Sidebar collapses to icon-only mode
- [ ] Toast notifications appear and auto-dismiss
- [ ] Auth form validates and shakes on error
- [ ] Signup wizard advances through 3 steps
- [ ] Trip creation wizard advances through 4 steps
- [ ] Packing checkboxes toggle with bounce animation
- [ ] Activity comments can be posted
- [ ] Admin feed appends new events every 8 seconds

### Responsive
- [ ] Mobile (375px): sidebar → bottom tab bar, single-column grids
- [ ] Tablet (768px): 2-column grids, icon-only sidebar
- [ ] Desktop (1440px): full three-panel itinerary builder, split auth layout

### Data Consistency
- [ ] "Alex Chen" is the logged-in user everywhere
- [ ] "Bali & Lombok Escape" is the active trip context
- [ ] Expense totals match chart data ($2,840 spent)
- [ ] Journal entries reference correct trip names

---

*Built to production standards. Every part is self-contained and additive.*
