# Dashboard Redesign + Mobile Responsiveness + Role Audit Prompt

Paste this into Cursor as a single instruction. It runs in three phases — analysis first, then design, then implementation. Do not skip the analysis phase even though it produces no visible UI change; it determines what gets built in phases 2 and 3.

---

You are a senior frontend engineer and product designer working on the AI-HMS Admin Console (React + Tailwind, Django backend). Your task spans three phases: analyze the existing role structure, redesign all dashboard widgets to match our minimalist design system, and make the entire admin dashboard fully mobile responsive. Work through the phases in order and do not write any new widget code until Phase 1 is complete and summarized back to me.

## PHASE 1 — Project & Role Analysis (read-only, no code changes)

Before touching any UI, inspect the actual codebase to build a real picture of the system:

1. Search the Django backend (`models.py`, `serializers.py`, role/permission definitions, `urls.py`) for every distinct user role currently implemented (e.g. Admin, Doctor, Nurse, Receptionist, and any others). For each role, list what data they can access and what actions they can perform.
2. Search the React frontend for route guards, role-based rendering (`ProtectedRoute`, role checks in components), and any existing per-role dashboard logic.
3. Cross-reference this against the sidebar items already visible in the Admin Console (System Overview, Financials, PMDC Compliance, IPD Bed Grid, Duty Roster, Appointments, Staff Onboarding, Doctor Reviews, Departments, Users Control, Security Audits) and identify:
   - Which of these pages currently have NO representation on the System Overview dashboard, even though they hold dashboard-worthy data.
   - Any role whose dashboard is currently missing entirely or reuses the Admin dashboard incorrectly.
4. Report back a short summary: list of roles found, what each role's dashboard currently shows (or doesn't), and which existing pages are "orphaned" from the overview screen. Wait for my confirmation before proceeding to Phase 2.

## PHASE 2 — Gap Analysis: Missing Widgets

Based on Phase 1, propose additional widgets for the System Overview dashboard that surface high-value signals from sections not currently represented. Treat this dashboard as a command-center / mission-control screen (Stripe Dashboard, Google Cloud Console home, Vercel project overview as reference points) — it should let an admin understand system health in 10 seconds without clicking into subpages. Specifically evaluate whether these are missing and worth adding:

- **Bed occupancy snapshot** (occupied/available/total from IPD Bed Grid)
- **Today's patient flow funnel** (registered → checked-in → triaged → consulted) as a single compact visual instead of four disconnected numbers
- **Revenue / financials snapshot** (today's billing total, pending invoices) pulled from Financials
- **Staff compliance expiry timeline** (upcoming PMDC expirations beyond the current 2-alert banner — a short list, not just a count)
- **Recent admin activity / audit log feed** (last 5 actions from Security Audits)
- **Department load breakdown** (patient count or appointment count per department)
- **Doctor utilization today** (consults completed vs scheduled, per doctor or aggregate)

For each, state in one line whether it's worth adding given real data availability, or whether it should wait until backend support exists. Do not add a widget for data that doesn't actually exist yet — a widget with permanently empty/fake state is worse than no widget.

## PHASE 3 — Widget Redesign (visual system)

Redesign every widget on the System Overview dashboard to match our established design system: single blue accent color, neutral gray/white surfaces, red reserved strictly for genuine alert states, no decorative gradients or glassmorphism, generous whitespace over heavy shadows, restraint over decoration (reference: Stripe, Google Cloud Console, Vercel, Microsoft Azure, Nvidia marketing pages).

Apply this to:
- Stat cards (icon chips neutral gray, not rainbow-coded per metric)
- Real-Time Operations Monitor numbers (neutral dark text, not traffic-lighted blue/orange/green)
- Compliance alert banner (light red tint background, solid blue action button — not gold/brown)
- Console Controls and Infrastructure Status section headers (neutral icon chips)
- Any new widgets approved in Phase 2, built in the same visual language as existing ones — same card padding, border radius, typography scale, and icon treatment. New widgets must look like they were always part of this system, not bolted on.

## PHASE 4 — Mobile Responsiveness

Make the full admin dashboard usable on mobile viewports (375px–428px) without breaking the desktop layout:

1. **Sidebar**: collapse into a hamburger-triggered drawer or bottom tab bar below `md` breakpoint. Do not just shrink the existing sidebar — it must fully hide/overlay on mobile.
2. **Top bar**: collapse the search bar into an icon that expands on tap; keep notification bell, theme toggle, and profile menu visible but tightened.
3. **Stat card grid**: reflow from 4-column to 2-column at `sm`, 1-column at smallest widths. Cards should not visually compress — let them stack rather than shrink text/icons below legible size.
4. **Real-Time Operations Monitor and other multi-stat widgets**: same reflow logic, 2-col then 1-col.
5. **Compliance banner**: stack the message above the button on mobile instead of forcing them onto one cramped row.
6. **Touch targets**: every interactive element (buttons, sidebar items, dropdown triggers) must meet a minimum 44px tap target on mobile.
7. **Tables/lists** (if any widget includes them): convert to stacked card rows on mobile rather than horizontally scrolling tables.

Use Tailwind's standard breakpoints (`sm`, `md`, `lg`) consistently with however breakpoints are already used elsewhere in the codebase — check existing usage first rather than introducing a new convention.

## PHASE 5 — Widget-to-Page Connectivity

Every widget on the dashboard currently displays a static number with no way to act on it. Wire each widget to the sidebar page it summarizes, so the dashboard functions as a live preview layer rather than a dead end. Use the existing React Router setup — do not introduce a new routing pattern.

Apply this mapping. Where a target page or filter doesn't exist yet, leave the widget non-clickable and flag it in your summary rather than linking to a 404 or building a stub page.

| Widget | Target page | Landing state |
|---|---|---|
| Total Active Staff | Users Control | Full staff list, filtered to active |
| Pending Applications | Staff Onboarding | Pending-review tab |
| Active Invite Tokens | Staff Onboarding | Token management section |
| Security Warnings | Security Audits | Failed logins, last 24h filter |
| Compliance banner "Resolve Compliance" button | PMDC Compliance | Filtered to the specific physicians flagged in the banner |
| Receptionist Check-ins | Appointments | Today's view, checked-in filter |
| Doctor Consultations | Doctor Reviews or Appointments | Completed consults, today |
| Nurse Triage Station | Nurse Triage page (if it exists) | Today's vitals log |
| Total Patient Directory | Patients page (if it exists) | Full registry |
| Bed occupancy snapshot (Phase 2) | IPD Bed Grid | — |
| Revenue/financials snapshot (Phase 2) | Financials | — |
| Staff compliance expiry timeline (Phase 2) | PMDC Compliance | — |
| Recent admin activity feed (Phase 2) | Security Audits | — |
| Department load breakdown (Phase 2) | Departments | — |
| Doctor utilization today (Phase 2) | Duty Roster | — |

Implementation rules:

1. **Deep-link with filters, not bare pages.** Where a "landing state" is specified above, pass it as a query param or route state (e.g. `/pmdc-compliance?status=expiring`) and have the target page read and apply that filter on mount. Do not just navigate to the unfiltered page and leave the admin to re-search for what the widget already showed them.
2. **Do not make the entire card the tap target.** Whole-card-click works on desktop but causes accidental navigation on mobile when mixed with scroll gestures. Add an explicit "View all →" link or chevron in each card's footer as the actual tap target. The rest of the card stays static display.
3. **Preserve existing widget content and redesign from Phase 3** — this phase only adds the navigation affordance and routing logic on top of the already-redesigned widgets, it does not change their visual treatment further.
4. Confirm with me before linking any widget whose target page doesn't support query-param filtering yet, since that may require a small backend or frontend filter-handling addition outside this pass's original scope.

## Constraints

- Do not change backend logic, API contracts, or data-fetching hooks unless a new widget genuinely requires a new endpoint — flag that separately rather than building it silently.
- Do not introduce any new color outside the existing blue accent + neutral gray/white + red-for-alerts palette.
- Do not change the sidebar's desktop appearance or item order.
- Keep all changes scoped to the System Overview dashboard and shared layout/nav components — do not touch other pages (Financials, IPD Bed Grid, etc.) in this pass.
- After each phase, give me a short summary of what changed before moving to the next phase.