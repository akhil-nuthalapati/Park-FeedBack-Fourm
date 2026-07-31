```txt
PROJECT TITLE
Park Maintenance System – Team Zenith

PROJECT TYPE
Government-style web application for monitoring park usage, collecting visitor feedback, and reporting maintenance issues through QR code-based access.

IMPORTANT DESIGN REQUIREMENTS

Design the entire frontend using a clean Government Portal UI inspired by Indian government websites (similar in layout and professionalism to municipal corporation websites), but DO NOT copy or use any government logos, branding, colors, or copyrighted assets.

The UI should look trustworthy, clean, minimal, responsive, and professional.

Technology
- React + Vite
- Tailwind CSS
- React Router
- Lucide React Icons
- Recharts (Dashboard)
- Responsive Mobile First Design

------------------------------------------------------------
GLOBAL LAYOUT
------------------------------------------------------------

TOP WATERMARK BAR (Government Style)

A thin full-width blue strip at the very top containing:

Left:
"Park Maintenance System"

Center:
"Team Zenith"

Right:
Current Date & Time (optional)

Below the top strip:

Main Header

Contains

• Generic circular logo placeholder
• Title
      Park Maintenance System
• Subtitle
      Smart Park Monitoring & Visitor Feedback Portal

Below header

Navigation

Home
About
Visitor Services
Dashboard (Admin Login)

Sticky navigation on desktop

Hamburger menu on mobile

------------------------------------------------------------
COLOR PALETTE
------------------------------------------------------------

Primary Blue
#0B5ED7

Dark Blue
#084298

Light Blue
#EAF4FF

Background
#F7F9FC

Cards
White

Text
#1E293B

Success
#198754

Warning
#FFC107

Danger
#DC3545

------------------------------------------------------------
TYPOGRAPHY
------------------------------------------------------------

Font

Poppins

or

Inter

Large Government style headings

Simple readable body text

No fancy fonts

------------------------------------------------------------
HOME PAGE
------------------------------------------------------------

Hero Banner

Large banner image of a public park.

Overlay title

"Welcome to Park Maintenance System"

Subtitle

"Smart monitoring, visitor engagement, and efficient maintenance management."

Primary Button

Check In

Secondary Button

Give Feedback

Outline Button

Report Maintenance Issue

------------------------------------------------------------

Below Hero

Three Feature Cards

Card 1

QR Based Check-In

Description

Scan the QR code placed at the park entrance to register your visit instantly.

Icon

QR Code

------------------------------------------------------------

Card 2

Visitor Feedback

Description

Help improve public parks by sharing your experience and suggestions.

Icon

Message Circle

------------------------------------------------------------

Card 3

Maintenance Reporting

Description

Report damaged equipment, overflowing bins, or cleanliness issues directly.

Icon

Wrench

------------------------------------------------------------

Statistics Section

Four cards

Today's Visitors

Average Rating

Open Issues

Resolved Requests

------------------------------------------------------------

Footer

Quick Links

Contact

Privacy Policy

Terms

Copyright

------------------------------------------------------------
CHECK-IN PAGE
------------------------------------------------------------

Card Layout

Park Name

Current Date

Current Time

Information Text

"Your visit helps us understand park usage and improve facilities."

Large Button

Confirm Check-In

After submission

Success popup

Redirect

Thank You Page

------------------------------------------------------------
FEEDBACK PAGE
------------------------------------------------------------

Large Government Form

Fields

Overall Rating

Cleanliness Rating

Safety Rating

Facilities Rating

Suggestions

Submit Button

Cancel Button

Show validation

Display success toast after submission

------------------------------------------------------------
MAINTENANCE PAGE
------------------------------------------------------------

Government style complaint form

Fields

Issue Category

Dropdown

Examples

Broken Bench

Dustbin Overflow

Street Light

Water Leakage

Play Equipment

Others

Description

Image Upload

Location

Submit Button

After submit

Success Screen

------------------------------------------------------------
THANK YOU PAGE
------------------------------------------------------------

Large Success Icon

Heading

Thank You

Message

"Your response has been recorded successfully."

Buttons

Home

Submit Another Response

------------------------------------------------------------
ABOUT PAGE
------------------------------------------------------------

Purpose of system

How QR Monitoring Works

Benefits

Frequently Asked Questions

Contact Information

------------------------------------------------------------
ADMIN LOGIN
------------------------------------------------------------

Centered login card

Email

Password

Remember Me

Forgot Password

Login Button

------------------------------------------------------------
ADMIN DASHBOARD
------------------------------------------------------------

Government dashboard layout

Left Sidebar

Dashboard

Visitor Analytics

Feedback

Maintenance Requests

Settings

Logout

Top Header

Notification Icon

Admin Profile

Dashboard Cards

Today's Visitors

Weekly Visitors

Average Rating

Pending Complaints

Charts

Visitors Trend

Feedback Distribution

Maintenance Status

Recent Activity Table

------------------------------------------------------------
FEEDBACK MANAGEMENT
------------------------------------------------------------

Search

Filter

Rating

Park

Suggestion

Date

Status

------------------------------------------------------------
MAINTENANCE MANAGEMENT
------------------------------------------------------------

Complaint Table

Issue

Park

Status

Image Preview

Assign

Resolve

------------------------------------------------------------
ANALYTICS PAGE
------------------------------------------------------------

Charts

Daily Visitors

Weekly Visitors

Monthly Visitors

Top Rated Parks

Most Reported Issues

Average Ratings

Export Report Button

------------------------------------------------------------
COMMON COMPONENTS
------------------------------------------------------------

Navbar

Footer

Cards

Buttons

Dropdown

Modal

Toast

Loader

Breadcrumb

Pagination

Tables

Charts

Confirmation Dialog

------------------------------------------------------------
ICONS
------------------------------------------------------------

Use Lucide React

QR Code

Map Pin

Users

Clipboard

Star

Wrench

Bar Chart

Calendar

Upload

Home

Bell

Settings

Log Out

------------------------------------------------------------
ANIMATIONS
------------------------------------------------------------

Subtle fade-in

Hover elevation on cards

Smooth page transitions

Button hover

Loading skeletons

No excessive animations

------------------------------------------------------------
RESPONSIVENESS
------------------------------------------------------------

Fully responsive

Desktop

Tablet

Mobile

Cards stack vertically on mobile

Sticky bottom action button on mobile

------------------------------------------------------------
BACKEND INTEGRATION (DO NOT IMPLEMENT DATABASE HERE)
------------------------------------------------------------

The frontend should be designed to integrate with a backend service.

Expected backend endpoints:

GET /parks/:id

POST /checkin

POST /feedback

POST /maintenance

POST /login

GET /dashboard

GET /analytics

GET /feedback

GET /maintenance

PUT /maintenance/:id

The frontend should separate API calls into a services layer (e.g., src/services/) and keep components focused on presentation. Use loading states, success/error notifications, and form validation, but do not include database logic or schema in this UI implementation.

------------------------------------------------------------
IMAGE REFERENCES (Free to Use)
------------------------------------------------------------

Use royalty-free or open-license images such as those from Unsplash or Pexels.

Hero Banner (Park):
https://images.unsplash.com/photo-1441974231531-c6227db76b6e

Public Park:
https://images.unsplash.com/photo-1506744038136-46273834b3fb

Walking Trail:
https://images.unsplash.com/photo-1470770841072-f978cf4d019e

Children's Park:
https://images.unsplash.com/photo-1500530855697-b586d89ba3ee

Green Landscape:
https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07

Alternatively, use these searchable collections:
https://unsplash.com/s/photos/public-park
https://www.pexels.com/search/park/

------------------------------------------------------------
FINAL DESIGN GOAL
------------------------------------------------------------

The application should resemble a modern Indian government service portal with a clean, trustworthy, and professional interface. It should provide an intuitive experience for citizens to check in to parks, submit feedback, and report maintenance issues, while offering administrators a comprehensive dashboard for monitoring park activity and service requests. Avoid any use of GVMC logos, branding, or copyrighted assets, but retain the overall government portal aesthetic through layout, typography, spacing, and color choices.
```

------------------------------------------------- here the frontend and backend finishes
_________________________________________________
now the data base part and structure , connect with my supabase project and my github account to push the created files automatically and also create a log file for the project like you need to generate a plan for the whole thing and create a plan in a text format and create a log txt file to keep checkpoints upto where you have finished the work so that if any issue arises in the project i can easily track and fix it and the project should be deployable in cloud platforms . 

__________________________________________

database structure in the supabase


ask for any creds if needed to log into my github and supabase to login

_____________________________________

# ANTIGRAVITY PROMPT
## Task: Design & Provision the Complete Supabase Backend for "Park Maintenance System" (Team Zenith)

Use this prompt as-is inside Antigravity to have the agent design, generate, and
provision the entire Supabase database layer — schema, security, storage, and
service-layer scaffolding — for the Park Maintenance System.

---

## 1. ROLE

You are a senior backend/database engineer specializing in Supabase and
PostgreSQL. You are building the backend for a **production-ready, government-style
civic-tech web application** called the **Park Maintenance System**. You must design
and provision the entire backend using **only Supabase** — there is no custom
Express/Node server. Every frontend interaction happens through the Supabase
JavaScript SDK.

---

## 2. CONTEXT

**Frontend:** React (Vite) + Tailwind CSS
**Backend:** Supabase (Database, Auth, Storage, Realtime)
**Database:** PostgreSQL
**Charts:** Recharts
**Deployment:** Vercel

The system has two user types:
1. **Visitors** — anonymous members of the public who scan a QR code at a park.
   They never log in. They can check in, submit feedback, and file maintenance
   complaints.
2. **Employees** — authenticated staff who log in via Supabase Auth and operate the
   admin dashboard, scoped by role: `SUPER_ADMIN`, `ADMIN`, `OFFICER`, `VIEWER`.

---

## 3. OBJECTIVE

Produce a complete, applied Supabase backend that includes:

1. All required PostgreSQL enum types and tables, with correct columns, types,
   constraints, defaults, and foreign keys.
2. Indexes on every foreign key and every column used for filtering/sorting in the
   dashboard (status, ward, created_at, etc).
3. Row Level Security (RLS) enabled on every table, with policies that enforce the
   permission matrix in Section 5 below — no table should be readable or writable
   beyond what that matrix allows.
4. A Supabase Storage bucket named `maintenance-images` for complaint photos, with
   storage policies matching Section 5.
5. Helper SQL functions/triggers needed to keep the schema self-maintaining (e.g.
   auto-stamping `resolved_at` when a complaint's status changes to `resolved`).
6. A seed script with realistic sample data (at least 5 parks, 20 visits, 10
   feedback entries, 8 maintenance requests across different statuses/priorities,
   and 4 employee profiles covering all four roles) for local development.
7. A matching set of frontend service files (`authService.js`, `parkService.js`,
   `visitService.js`, `feedbackService.js`, `maintenanceService.js`,
   `employeeService.js`) that wrap the Supabase JS SDK and expose typed functions
   for every operation described in Section 6.

Do not invent tables, columns, or roles beyond what is specified. If something is
ambiguous, choose the most conservative, security-first interpretation and note the
assumption in a comment.

---

## 4. DATABASE SCHEMA TO IMPLEMENT

### Enum types
- `park_status`: `active`, `inactive`, `maintenance`
- `user_role`: `SUPER_ADMIN`, `ADMIN`, `OFFICER`, `VIEWER`
- `issue_type`: `equipment`, `lighting`, `hygiene`, `safety`, `greenery`, `other`
- `priority_level`: `low`, `medium`, `high`, `critical`
- `request_status`: `open`, `in_progress`, `resolved`, `rejected`

### Table: `parks`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| name | text | not null |
| location | text | |
| ward | text | indexed |
| latitude | numeric(9,6) | |
| longitude | numeric(9,6) | |
| status | park_status | default 'active' |
| qr_code | text | unique, not null |
| created_at | timestamptz | default now() |

### Table: `visits`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| park_id | uuid | FK → parks(id) ON DELETE CASCADE |
| visit_time | timestamptz | default now() |
| device_id | text | |
| created_at | timestamptz | default now() |

### Table: `feedback`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| park_id | uuid | FK → parks(id) ON DELETE CASCADE |
| overall_rating | smallint | not null, 1–5 |
| cleanliness | smallint | 1–5 |
| safety | smallint | 1–5 |
| facilities | smallint | 1–5 |
| greenery | smallint | 1–5 |
| lighting | smallint | 1–5 |
| playground | smallint | 1–5 |
| washroom | smallint | 1–5 |
| suggestion | text | |
| anonymous | boolean | default true |
| created_at | timestamptz | default now() |

### Table: `maintenance_requests`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK |
| park_id | uuid | FK → parks(id) ON DELETE CASCADE |
| issue_type | issue_type | not null |
| priority | priority_level | default 'medium' |
| description | text | not null |
| photo_url | text | |
| status | request_status | default 'open' |
| assigned_to | uuid | FK → profiles(id) ON DELETE SET NULL |
| resolved_at | timestamptz | nullable, auto-set by trigger |
| created_at | timestamptz | default now() |

### Table: `profiles`
| Column | Type | Constraints |
|---|---|---|
| id | uuid | PK, default gen_random_uuid() |
| auth_user_id | uuid | unique, FK → auth.users(id) ON DELETE CASCADE |
| full_name | text | not null |
| email | text | unique, not null |
| phone | text | |
| designation | text | |
| department | text | |
| role | user_role | default 'VIEWER' |
| active | boolean | default true |
| created_at | timestamptz | default now() |

---

## 5. PERMISSION MATRIX (must be enforced via RLS, not just frontend logic)

| Table | Anonymous Visitor | VIEWER | OFFICER | ADMIN | SUPER_ADMIN |
|---|---|---|---|---|---|
| parks | read (active only) | read | read | read + write | full |
| visits | insert only | read | read | read | full |
| feedback | insert only | read | read | read | full |
| maintenance_requests | insert only | read | read + update status | read + write | full |
| profiles | no access | read own | read own | read own | full (manage all employees) |
| storage: maintenance-images | insert + read | read | read | read + delete | full |

Rules to encode explicitly:
- Anonymous (`anon`) role must never be able to `SELECT` from `visits`, `feedback`,
  `maintenance_requests`, or `profiles`.
- Every authenticated write to `profiles` (create/update/delete employee) must be
  gated to `SUPER_ADMIN` only.
- `OFFICER` may update `status` and `assigned_to` on `maintenance_requests` but must
  not be able to delete records — only `ADMIN`/`SUPER_ADMIN` can delete.
- Use a `security definer` SQL function (e.g. `current_user_role()`) to look up the
  caller's role from `profiles` inside policies, rather than repeating subqueries.

---

## 6. SERVICE LAYER FUNCTIONS TO GENERATE

For each file, generate small, single-purpose async functions that call the
Supabase JS SDK and return `{ data, error }`. Do not add UI code.

- **authService.js** — `login(email, password)`, `logout()`, `getCurrentUser()`,
  `getCurrentSession()`, `sendPasswordReset(email)`, `getUserRole()`
- **parkService.js** — `getAllParks()`, `getParkById(id)`, `getParkByQrCode(code)`,
  `createPark(payload)` (admin), `updatePark(id, payload)` (admin)
- **visitService.js** — `logVisit(parkId, deviceId)`, `getVisitCount(parkId, range)`,
  `getDailyVisitors(parkId)`
- **feedbackService.js** — `submitFeedback(payload)`, `getFeedbackByPark(parkId)`,
  `getAverageRatings(parkId)`
- **maintenanceService.js** — `submitComplaint(payload)`,
  `uploadComplaintPhoto(file)`, `getComplaints(filters)`, `assignComplaint(id, employeeId)`,
  `updateStatus(id, status)`
- **employeeService.js** — `getEmployees()`, `createEmployee(payload)` (creates
  Supabase Auth user, then inserts profile row), `updateEmployee(id, payload)`,
  `deactivateEmployee(id)`, `deleteEmployee(id)`, `resetEmployeePassword(id)`

---

## 7. OUTPUT FORMAT

Produce the output as the following files, in this order:

1. `supabase/schema.sql` — enums + tables + indexes only
2. `supabase/policies.sql` — RLS enablement + all policies + storage bucket/policies
3. `supabase/functions.sql` — helper functions and triggers
4. `supabase/seed.sql` — sample data described in Section 3.6
5. `src/services/authService.js`
6. `src/services/parkService.js`
7. `src/services/visitService.js`
8. `src/services/feedbackService.js`
9. `src/services/maintenanceService.js`
10. `src/services/employeeService.js`

Each SQL file must be idempotent where possible (`create table if not exists`,
`on conflict do nothing` for seeds) so it can be re-run safely during development.

---

## 8. CONSTRAINTS

- Do not create an Express.js or Node.js custom backend of any kind.
- Do not store or hash passwords manually — all auth must go through Supabase Auth.
- Do not expose service-role keys in any frontend file; only the public anon key
  belongs in `.env` / `import.meta.env`.
- Do not grant `anon` role SELECT access on `visits`, `feedback`,
  `maintenance_requests`, or `profiles` under any circumstance.
- Keep every RLS policy explicit and readable — prefer named, single-purpose
  policies over one large catch-all policy per table.

---

## 9. VERIFICATION CHECKLIST (agent must confirm before finishing)

- [ ] All 5 enum types created
- [ ] All 5 tables created with correct columns/types/constraints
- [ ] All foreign keys and indexes present
- [ ] RLS enabled on all 5 tables
- [ ] Anonymous role can INSERT but not SELECT on visits/feedback/maintenance_requests
- [ ] SUPER_ADMIN-only policies verified on profiles table
- [ ] OFFICER can update but not delete maintenance_requests
- [ ] Storage bucket `maintenance-images` created and publicly readable
- [ ] Trigger auto-sets `resolved_at` on status change to `resolved`
- [ ] Seed data inserts without constraint violations
- [ ] All 6 service files export the functions listed in Section 6


these are all the things now create a park maintenence system.