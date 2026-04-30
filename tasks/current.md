# Current Tasks

## Completed
- [x] **LAPER-001**: Self-Registration for Klien (auto-activation on email confirmation)
- [x] **LAPER-002**: Self-Registration for Ahli Gizi (pending approval screen + route guard)
- [x] **LAPER-003**: Build shared registration form UI
- [x] **REG-001**: Update registration mechanism — ALL users require admin approval
- [x] **REG-002**: Build Admin User Management with approve/reject functionality

---

## Active Work
None — registration flow is complete and committed.

---

## Backlog: Features from LAPER_Backlog_v2.md vs Current Code State

### Epic 1 — User Management (5 stories total)

| US | Description | Status | Notes |
|----|-------------|--------|-------|
| US-01 | Register with email, password, name, DOB, gender, WhatsApp | ✅ Done | Implemented in RegisterPage |
| US-02 | Login and logout | ✅ Done | LoginPage existing, role-based redirect working |
| US-03 | Admin approve/reject user registration | ✅ Done | **COMPLETED** — S-17 with filter tabs + inline approve/reject |
| US-22 | Ahli Gizi register/login with nutritionist role | ✅ Done | Role selector in register |
| US-38 | User cannot edit own profile; only admin/ahli gizi can | ⚠️ Partial | Route guard exists, but profile edit form not built |

**Epic 1 Progress: 4/5 complete (80%)**

---

### Epic 2 — Food Logging (9 stories total)

| US | Description | Status | Notes |
|----|-------------|--------|-------|
| US-04 | Type food in Indonesian → AI returns calorie + macro | ❌ Todo | Food log entry page (S-07) not built |
| US-05 | Confirm entry before submitting | ❌ Todo | Part of S-07 UI flow |
| US-08 | Vague input → prompt user to specify | ❌ Todo | Edge function logic needed |
| US-13 | Meal category selector + meal time notifications | ❌ Todo | Categories in form, notification system not built |
| US-42 | Dynamic multi-item entry (cashier-style) | ❌ Todo | Key feature of S-07 |
| US-43 | Receipt-style summary after submit | ❌ Todo | S-08 screen not built |
| US-40 | Log physical activity (type + duration) | ❌ Todo | S-10 screen not built |

**Epic 2 Progress: 0/9 complete (0%)**

---

### Epic 3 — Data Visualization (7 stories total)

| US | Description | Status | Notes |
|----|-------------|--------|-------|
| US-10 | Today's food log + summary + weekly chart with limit line | ❌ Todo | User dashboard (S-04) not built |
| US-11 | Calorie log with flexible timeframe selector | ❌ Todo | Dashboard feature |
| US-12 | Daily calorie target from Harris-Benedict + remaining display | ❌ Todo | Depends on assessment data |
| US-36 | Profile chart: BB, TB, lemak, otot, lingkar perut, calorie needs | ❌ Todo | S-11 chart section |
| US-44 | Trending food section on dashboard | ❌ Todo | Database query + UI for all dashboards |
| US-45 | Complete food log history on Progress page | ❌ Todo | S-09 screen not built |
| US-46 | Ad carousel banner (600×300, 3 PNG) on dashboard | ❌ Todo | AdBannerCarousel component exists, not wired to dashboards |

**Epic 3 Progress: 0/7 complete (0%)**

---

### Epic 4 — Admin & Research (5 stories total)

| US | Description | Status | Notes |
|----|-------------|--------|-------|
| US-14 | Export all user data as CSV | ❌ Todo | S-18 screen not built |
| US-15 | Filter CSV export by date range | ❌ Todo | Part of S-18 |
| US-16 | List of all registered users | ✅ Done | **COMPLETED** — S-17 with search + filter tabs |
| US-17 | Delete user account | ✅ Done | **COMPLETED** — Reject button in S-17 |
| US-37 | Admin/ahli gizi view and edit complete user profile | ❌ Todo | S-11 edit mode + S-12/13 assessment flow |

**Epic 4 Progress: 3/5 complete (60%)**

---

### Epic 5 — Polish & Growth (1 story total)

| US | Description | Status | Notes |
|----|-------------|--------|-------|
| US-18 | Save frequently logged foods as favorites | ❌ Todo | V2 feature |

**Epic 5 Progress: 0/1 complete (0%)**

---

### Epic 6 — Nutrition Assessment (13 stories total)

| US | Description | Status | Notes |
|----|-------------|--------|-------|
| US-23 | Ahli gizi select participant from user list | ❌ Todo | S-16 Participant List not built |
| US-24 | Input weight (BB) and height (TB) | ❌ Todo | S-12 Assessment Form not built |
| US-25 | BMI calculated automatically | ⚠️ Partial | bmiCalculator.js exists, not wired to UI |
| US-26 | Mandatory reassessment: BB, TB, activity level → recalculate calorie needs | ❌ Todo | Core of S-12 |
| US-29 | Record activity level (4 levels) | ❌ Todo | Part of S-12 |
| US-34 | Input/update lingkar perut, massa otot, massa lemak | ❌ Todo | Part of S-12 |
| US-30 | Write evaluation note per session | ❌ Todo | S-13 Evaluation Form not built |
| US-31 | View full evaluation history (ahli gizi) | ❌ Todo | S-14 not built |
| US-32 | View own evaluation history (user) | ❌ Todo | S-15 not built |
| US-33 | 2-week interval enforcement + notifications | ❌ Todo | Backend rule + notification system |
| US-35 | Log all profile changes: who, when, old→new | ❌ Todo | Audit trail system needed |
| US-39 | Share evaluation to WhatsApp button | ❌ Todo | Post-submit action on S-13 |
| US-28 | View BB/TB/BMI history per participant | ❌ Todo | Chart/visualization needed |

**Epic 6 Progress: 0/13 complete (0%)**

---

## Screen Inventory Status (from LAPER_Screen_Inventory.md)

| Screen | Route | Status |
|--------|-------|--------|
| S-01 Register | `/register` | ✅ Built |
| S-02 Login | `/login` | ✅ Built |
| S-03 Pending Approval | `/menunggu-persetujuan` | ✅ Built |
| S-04 Dashboard — User | `/dashboard` (klien) | ❌ Todo |
| S-05 Dashboard — Ahli Gizi | `/dashboard` (ahli_gizi) | ❌ Todo |
| S-06 Dashboard — Admin | `/dashboard` (admin) | ❌ Todo |
| S-07 Food Log Entry | `/food-log/new` | ❌ Todo |
| S-08 Food Log Receipt | `/food-log/receipt` | ❌ Todo |
| S-09 Progress Page | `/progress` | ❌ Todo |
| S-10 Exercise Log | `/exercise-log` | ❌ Todo |
| S-11 User Profile View | `/profile/:id` | ❌ Todo |
| S-12 Assessment Form | `/assessment/:userId` | ❌ Todo |
| S-13 Evaluation Form | `/evaluation/:userId` | ❌ Todo |
| S-14 Evaluation History (AG) | `/evaluation/:userId/history` | ❌ Todo |
| S-15 Evaluation History (User) | `/my-evaluations` | ❌ Todo |
| S-16 Participant List | `/participants` | ❌ Todo |
| S-17 Admin User Management | `/admin/users` | ✅ Built |
| S-18 Admin Export CSV | `/admin/export` | ❌ Todo |

**Screens Complete: 4/18 (22%)**

---

## Priority Next Steps

Based on Sprint 1 goals (1 Mei 2026):

**Sprint 1 — "Minimum Working Tracker"**
- [ ] Food Log Entry (S-07) with multi-item dynamic entry
- [ ] Food Log Receipt (S-08) with calorie/macros breakdown
- [ ] User Dashboard (S-04) with today's log, summary, weekly chart
- [ ] OpenAI integration for food calorie estimation

**Immediate Next:** Build Food Log Entry (S-07) as it's the core value proposition.

---

## Database Schema Notes

Current schema handles: profiles, body_measurements, food_units, food_logs, food_log_items, assessments, user_evaluations, food_name_suggestions

**Missing for full features:**
- `exercise_logs` table (US-40, S-10)
- `assessment_sessions` proper structure (US-26, US-30, US-31) — may need refactor of existing assessments table
- `change_logs` or audit table (US-35)
- `notifications` table (US-13, US-33)
- `favorites` table (US-18)
- Food log meal category (US-13) — could be enum on food_log_items

---

## Recent Decisions
- Registration form shared between Klien and Ahli Gizi roles
- **ALL registrations require admin approval (is_active=false initially)**
- **No email confirmation needed**
- **User cannot login until admin approves**
- Inactive users redirected to /menunggu-persetujuan
- Admin User Management (S-17) has filter tabs + inline approve/reject buttons
- handle_new_user trigger stores jenis_kelamin, berat_badan, tinggi_badan
- First body_measurements record auto-inserted on registration

## Next Session
Start Sprint 1: Build Food Log Entry (S-07) with OpenAI integration for calorie estimation.
