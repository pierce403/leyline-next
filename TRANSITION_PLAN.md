# Leyline Transition Plan — ASP.NET MVC (Azure) → Next.js / TypeScript (Vercel)

This document is the implementation checklist and functional/UX spec for rebuilding the Leyline app as a Next.js + TypeScript app hosted on Vercel, using TailwindCSS, Auth0, and Stripe.

The goal is to:

- Replicate the existing Leyline UX and visual layout as closely as reasonably possible.
- Move authentication and user access levels to Auth0.
- Move subscriptions/billing to Stripe (Free / Basic / Pro).
- Support exporting courses from the legacy app and importing them into the new app.

The future coding agent should be able to implement the new app **without opening the existing C# code**, using this file only.

---

## 1. High‑Level Objectives

- [ ] Recreate Leyline’s public pages (login, register, terms, privacy, welcome, landing).
- [ ] Recreate the authenticated main application (Dashboard, Education, Companies, Portfolio, Profile, Account).
  - [x] Implement Dashboard UI (Investments, Education Progress, Reminders, Portfolio Chart).
- [ ] Recreate the admin area (Users, Registration, Invitations, Education content management, Subscriptions/Transactions, Settings).
- [ ] Implement Auth0‑based authentication and user access levels (Free, Basic, Pro, plus internal admin roles).
- [ ] Implement Stripe‑based subscription billing and plan changes.
- [ ] Implement course export/import flow using the legacy app’s course export ZIP format.
- [ ] Deploy to Vercel with environment configuration for Auth0, Stripe, and the database.

---

## 2. Target Tech Stack

- **Frontend / App**
  - Next.js (TypeScript, App Router).
  - React 18+.
  - Tailwind CSS for styling.
  - Font Awesome for icons (v5+).

- **Auth & Identity**
  - Auth0 as the identity provider and source of truth for:
    - User identity/profile.
    - Application “access type” (membership: Free, Basic, Pro).
    - Admin and content roles (Sales, Owner, ContentAdmin, Admin, SuperAdmin, Master).

- **Billing**
  - Stripe for subscription payments.
  - Plans:
    - `leyline_free` (no Stripe subscription; default).
    - `leyline_basic` (Stripe recurring subscription).
    - `leyline_pro` (Stripe recurring subscription).

- **Backend / Data**
  - Next.js API routes / Route Handlers for server logic.
  - Relational database (PostgreSQL strongly recommended) with an ORM (Prisma recommended).
  - Object storage for course media (images/videos) — e.g. AWS S3, Cloudflare R2, or similar.

- **Hosting**
  - Vercel for application hosting.
  - DB and storage hosted separately (e.g. managed Postgres + S3).

---

## 3. Global Look & Feel (Visual/UX Parity)

### 3.1 Base Layout and Theme

The current app uses an Appwork/Bootstrap 4 theme with a clean, white, card‑driven UI. The new app should visually match:

- **Layout**
  - Light theme only.
  - Fixed top navigation bar (`layout-navbar`).
  - For Admin pages, a vertical left side navigation (sidenav) plus the same top navbar.
  - Content area in a full‑width `container-fluid` with vertical padding.

- **Fonts**
  - Google Fonts:
    - Roboto (primary).
    - Raleway (for headings).
    - PT Serif and Pacifico are referenced but can be optional; use Roboto + Raleway primarily.

- **Color Palette (approximate from existing UI)**
  - Primary accent green: `#a7c14e` (used to highlight active nav items and selected course items).
  - Primary blue (links/badges): something like `#5b7ba2`.
  - Background: white.
  - Text: standard dark gray, with lighter gray text for muted labels.

- **Components to closely match**
  - Cards with headers and subtle borders.
  - Bootstrap‑like tables with alternating row stripes.
  - Badges (e.g., for “Mock” investments, membership level).
  - Modal dialogs for forms (companies, investments, course/module/lesson editing, membership plan selection).

### 3.2 Navigation & Header

Replicate the main navbar:

- Left:
  - Leyline logo (different image per environment is not required; one logo is fine).
  - Logo clickable to go to the dashboard (`/` when authenticated).

- Center:
  - (No items; keep open for potential future use).

- Right (for authenticated users when app is not “landing‑page only”):
  - **Dashboard** link (`/`) with icon `fa-tachometer-alt`.
  - **Education** link (`/education`) with icon `fa-graduation-cap`.
  - **Companies** link (`/companies`) with icon `fa-building`.
  - **Portfolio** link (`/portfolio`) with icon `fa-chart-line`.
  - **Admin** link (only when user has admin‑level access), text determined by access type:
    - “Sales”, “Owner”, “Content Admin”, “Admin”, “Super Admin”, “Master”.
    - Link path: `/admin`.
  - Vertical dividers rendered as `|` between sections for desktop.
  - **User Level Badge**:
    - Small pill/badge showing membership label, e.g. “Leyline Free”, “Leyline Basic”, “Leyline Pro”.
    - Clicking opens “Choose Your Leyline Membership” modal.
  - **User Dropdown**:
    - Avatar circle (uses profile image if available; default placeholder otherwise).
    - On click, dropdown with:
      - “My Profile” → `/profile/[alias]`.
      - “My Account” → `/account`.
      - “Change Password” → `/account/password`.
      - “Subscriptions” → `/account/subscriptions`.
      - Divider.
      - “Log Out” → triggers Auth0 logout.

### 3.3 Layout Types

Implement three top‑level layouts in Next.js:

1. **Public Layout**
   - No main navbar.
   - Centered column (roughly 400–600px wide) for login/register forms.
   - Leyline logo centered above forms.

2. **Main Layout (Authenticated)**
   - Fixed top navbar as described above.
   - Single column content area (full width) with `container-fluid` and vertical padding.
   - Standard page titles centered, all‑caps, medium weight (e.g., `text-center text-uppercase`).

3. **Admin Layout**
   - Same top navbar as Main Layout.
   - Persistent left sidenav with sections:
     - Admin Dashboard (`/admin`).
     - Users (Users list, Registration, Invitations).
     - Financial (PayPal/Stripe events, Transactions, Subscriptions).
     - Education (Programs, Courses, Modules, Links).
     - Settings (App Settings).
   - Right side content area (card lists, tables, etc.).

---

## 4. Routing Structure (Next.js App Router)

Use the App Router with route groups to separate public vs authenticated vs admin:

```text
app/
  layout.tsx                         // Root layout, includes Auth0 provider, theme, fonts
  page.tsx                           // Authenticated dashboard (redirects to login if unauthenticated)

  (public)/
    layout.tsx                       // Public layout (no main navbar)
    login/page.tsx                   // /login
    register/page.tsx                // /register
    forgot-password/page.tsx         // /forgot-password
    reset-password/[token]/page.tsx  // /reset-password/[token]
    terms/page.tsx                   // /terms
    privacy/page.tsx                 // /privacy
    welcome/page.tsx                 // /welcome (welcome/after registration)
    landing/page.tsx                 // /landing

  (app)/
    layout.tsx                       // Main layout with navbar

    dashboard/page.tsx               // /dashboard (alias for /)
    education/
      page.tsx                       // /education (courses grid)
      course/[courseSlug]/page.tsx   // /education/course/[id-slug]
      program/[programSlug]/page.tsx // /education/program/[id-slug]

    companies/
      page.tsx                       // /companies
      [companyId]/page.tsx           // /companies/[id] (details)

    portfolio/
      page.tsx                       // /portfolio
      [investmentId]/page.tsx        // /portfolio/[id] (investment details)

    profile/
      [alias]/page.tsx               // /profile/[alias]
      edit/[alias]/page.tsx          // /profile/edit/[alias]

    account/
      page.tsx                       // /account
      password/page.tsx              // /account/password
      subscriptions/page.tsx         // /account/subscriptions

    membership/
      modal.tsx                      // Component for membership modal (invoked globally)

    admin/
      layout.tsx                     // Admin layout with sidenav
      page.tsx                       // /admin
      users/page.tsx                 // /admin/users
      registration/page.tsx          // /admin/registration
      invitations/page.tsx           // /admin/invitations
      transactions/page.tsx          // /admin/transactions
      subscriptions/page.tsx         // /admin/subscriptions

      education/
        programs/page.tsx            // /admin/education/programs
        courses/page.tsx             // /admin/education/courses
        modules/page.tsx             // /admin/education/modules
        links/page.tsx               // /admin/education/links

      settings/page.tsx              // /admin/settings
```

> Implementation note: Actual file structure can vary, but the UX and URL patterns should match the legacy app as closely as possible.

---

## 5. Page‑Level UX Specifications

This section describes what each major page should look like and how it should behave, based on the current app.

### 5.1 Public Pages

#### 5.1.1 Login (`/login`)

- Centered card with:
  - Leyline logo above the form.
  - Title: “Login to Your Account”.
  - Fields:
    - Email (text input).
    - Password (password input).
    - “Remember me” checkbox.
  - Link: “Forgot password?” aligned to the right of the Password label.
  - Submit button: “Sign In”.
  - Below form: “Don’t have an account yet? Sign Up” link to `/register`.
- Auth0:
  - Use Auth0 Universal Login or embedded login via `@auth0/nextjs-auth0`.
  - The UI should still visually match this simple form; if using Universal Login, theme it accordingly.

#### 5.1.2 Register (`/register`)

- Similar layout to Login.
- Fields:
  - First name, Last name.
  - Email.
  - Password & Confirm Password.
  - Optional terms/privacy acceptance checkbox.
- After successful registration:
  - Redirect to `/welcome` (or dashboard) and show a “Confirm your email” message if appropriate.

#### 5.1.3 Forgot Password (`/forgot-password`)

- Simple form:
  - Email input.
  - Button “Reset Password”.
  - Message: instructs user to check email.
- Implement using Auth0’s password reset flow (send reset email).

#### 5.1.4 Reset Password (`/reset-password/[token]`)

- Form:
  - New password.
  - Confirm new password.
  - Submit button.
- Implement via Auth0 password reset link or custom flow according to Auth0 best practices.

#### 5.1.5 Terms (`/terms`) and Privacy (`/privacy`)

- Static pages with text content and titles “Terms of Service” / “Privacy Policy”.
- Simple centered column, standard typography.

#### 5.1.6 Welcome (`/welcome`)

- Page shown after registration or email confirmation.
- Content:
  - Friendly headline welcoming the user.
  - Short summary of what Leyline offers.
  - “Go to Dashboard” button.

#### 5.1.7 Landing (`/landing`)

- Authenticated page using Main Layout.
- Content:
  - A series of paragraphs explaining:
    - Welcome Beta Users.
    - Description of investor education, accreditation tools, research tools, investor profile, and investment portfolio features.
  - Styled as simple paragraphs inside a centered column (`col-lg-10 col-xl-6` equivalent).

### 5.2 Authenticated Main Pages

#### 5.2.1 Dashboard (`/` or `/dashboard`)

Layout:

- Title: centered “Dashboard” (text is implicit; the current dashboard page focuses on content rather than a big title — you may use a simple heading or rely on the navbar).
- Two main columns on desktop:
  - **Left column** (~50% width, or full width if no investments):
    - Card: “Investments” with:
      - Table listing real investments:
        - Columns: “Details / New Transaction” (buttons), Company, Type, Owned, Value.
      - Below that, if present, similar table for mock investments including “Mock” badges.
      - Under the tables: line chart labeled “Portfolio Value” showing real and mock investments over time (monthly).
  - **Right column** (~50% width):
    - Card: “Educational Progress”:
      - Table listing incomplete education programs.
      - Columns: Action (Start/Resume button), Program, Completed (%), Accessed (date/time if accessed).
      - “View All Educational Programs” link above table to `/education`.
    - Card (optional): “Reminders”:
      - List of reminders linking to individual investments with due dates.
      - Each reminder shows text and a deadline date.

Behavior:

- If the user has no investments, the Investment section should show an appropriate empty state (e.g., “You have no investments yet. Add your first investment from the Portfolio page.”).
- Charts: render using Chart.js or a similar library; match the line chart look.

#### 5.2.2 Education Overview (`/education`)

Layout:

- Title: “Education” centered, all caps.
- Optional alert if the user attempts to access content above their membership level, with a “Upgrade Now” button that opens the membership modal.
- Grid of course cards:
  - Each card:
    - Cover image:
      - If course has a cover image, show it as a top area (approx. 200px height).
      - Otherwise, use a default course image.
    - Course name as `<h4>`.
    - Course description.
    - CTA button:
      - If percent completed = 100: “Review Course”.
      - If 0 < percent < 100: “Resume Course”.
      - If percent = 0: “Start Course”.
      - If user lacks required access level: show `Upgrade to [Free/Basic/Pro]` button instead, which opens membership modal.
    - Small text under button (if course started) showing:
      - Percent completed.
      - Last accessed date/time and time zone abbreviation.

Behavior:

- Courses are filtered by user’s access level (Free/Basic/Pro).
- Courses link to `/education/course/[id-slug]`.

#### 5.2.3 Course Detail (`/education/course/[id-slug]`)

Layout:

- Top row:
  - Left: Course title in uppercase, bold; below it a line showing the current module/lesson name (e.g., `Module 1: Lesson 2`).
  - Right: Navigation area for Next/Previous lesson actions (buttons).

- Below:
  - Two columns:
    - **Left column (desktop only)**:
      - Course outline as nested list, organized as:
        - Module header row with book icon.
        - Under each module, italicized lessons with file icon.
      - The current item is highlighted with:
        - Special color (`#a7c14e`) and bold text (`course-item-selected`).
      - Completed lessons/modules have a checkmark icon.
    - **Right column**:
      - Main lesson content container (`div-LessonContent` equivalent).
      - Content depends on `ContentType`:
        - Text / HTML: render formatted HTML.
        - Image: centered image.
        - Video: embedded video player.
        - MultipleChoice: question with options, explanation after answer.

Behavior:

- When the page loads:
  - If `AutoResume` is true (i.e., the user has started the course), automatically load the next incomplete lesson.
  - If not, load the first lesson.
- Navigation:
  - Next/Previous buttons update the right column and highlight the correct item in the left outline.
  - Progress is persisted so the user can resume later.

#### 5.2.4 Program Detail (`/education/program/[id-slug]`)

Very similar to Course Detail, but with a hierarchy:

- Left outline:
  - Course name (with teacher icon).
  - Under each course, modules and lessons.
  - Completed items show checkmarks.

- Right content:
  - Lesson content same as in Course Detail.

#### 5.2.5 Companies (`/companies`)

Layout:

- Title: “Companies” centered, all caps.
- Below title: centered “Add New Company” button:
  - Button: outline style, small, with plus icon.
  - Clicking opens a modal form for adding/editing company details.

- Main row:
  - Left column:
    - Dynamic list of companies (search/filter results) rendered in a card or table.
  - Right column (if there are related education courses):
    - Stack of course cards (similar style to Education page but smaller):
      - Course name & description.
      - Button: “Start Course”, “Resume Course”, or “Review Course” based on progress.
      - Progress/last accessed info.

#### 5.2.6 Portfolio (`/portfolio`)

Layout:

- Title: “Portfolio” centered, all caps.
- “New Investment” button centered under title (outline style with plus icon, opens modal).
- Main content:
  - Table listing investments:
    - Columns: Action buttons, Company, Type, Owned, Value.
    - Action buttons:
      - “Details” → `/portfolio/[investmentId]`.
      - “New Transaction” → opens a transaction modal.
  - Below table: for users with education courses, grid of small course cards like on the Companies page.

#### 5.2.7 Portfolio Investment Detail (`/portfolio/[investmentId]`)

Layout (approximate):

- Card with investment summary:
  - Company name, type, mock/real status.
  - Owned amount (shares or %).
  - Current value.
  - List of past transactions or notes.

> The exact fields can be modeled based on Investment and Transaction entities described in the data model section.

#### 5.2.8 Profile (`/profile/[alias]`)

Layout:

- Top section:
  - Left:
    - User profile picture (rounded circle).
    - Full name.
    - Alias (`@@alias`).
  - Right:
    - If viewing own profile or having admin rights: “Edit Profile” button linking to `/profile/edit/[alias]`.

- Cards below:
  - **Investment Interests**:
    - Table showing tags under categories:
      - Investment Goals.
      - Strategies.
      - Personal Investment Preferences.
      - Investment Criteria.
    - Tags are small pill badges.
  - **Professional Experience**:
    - Multi-line text, each line on its own line.
  - **Education**:
    - Multi-line text.
  - **Certifications/Honors**:
    - Multi-line text.
  - **Accreditation Status**:
    - “Accredited” with green check icon or “Not Accredited” with red X icon.
  - **Completed Leyline Programs**:
    - List of completed programs with award icon, program name, and completion date/time.
  - **Courses section (for own profile)**:
    - Grid of course cards with progress badges and Start/Resume/Review buttons.

#### 5.2.9 Account (`/account`, `/account/password`, `/account/subscriptions`)

- `/account`:
  - Card with fields:
    - Name, email, alias.
    - Optional phone number.
  - Buttons to update details.

- `/account/password`:
  - Form to change password:
    - Current password.
    - New password + confirmation.
  - On success, show confirmation message.
  - Implement using Auth0’s change password capabilities (or redirect to Auth0’s password management).

- `/account/subscriptions`:
  - Show current membership level (Free, Basic, Pro).
  - If basic/pro:
    - Show Stripe subscription details (plan name, status, renewal date).
    - Buttons: “Change Plan”, “Cancel Subscription”.
  - If free:
    - Show membership comparison and “Upgrade to Basic/Pro” actions (open membership modal).

### 5.3 Admin Area

#### 5.3.1 Admin Layout & Sidenav

Sidenav sections (visible depending on access level):

- Admin Dashboard (`/admin`).
- **Users**:
  - Users list (`/admin/users`).
  - Registration (`/admin/registration`).
  - Invitations (`/admin/invitations`).
- **Financial**:
  - Events/errors (in the new app, focus on Stripe rather than PayPal).
  - Transactions (`/admin/transactions`).
  - Subscriptions (`/admin/subscriptions`).
- **Education**:
  - Programs (`/admin/education/programs`).
  - Courses (`/admin/education/courses`).
  - Modules (`/admin/education/modules`).
  - Links (`/admin/education/links`) — mapping courses to locations (dashboard, portfolio, companies, profile, etc.).
- **Settings**:
  - App Settings (`/admin/settings`).
- “Return to Application” link at bottom (back to `/`).

#### 5.3.2 Admin Education — Courses (`/admin/education/courses`)

Layout:

- Title: “Courses”.
- “New Course” button:
  - Opens modal with fields: Name, Description, Status (Free/Basic/Pro/Development), Cover image.
  - After create/update, updates list.

- Table:
  - Columns:
    - Actions:
      - Edit (opens course edit modal).
      - Export (downloads course export ZIP; see export format below).
    - Course name (sortable).
    - Modules count.
    - Lessons count.
    - Status (with dropdown to change between Free/Basic/Pro/Development).
    - Created timestamp.
    - Updated timestamp.

- At least one action should allow open a course builder view:
  - Manage modules and lessons for a course using drag‑and‑drop lists (matching the legacy “sortable” lists).

#### 5.3.3 Admin Education — Modules / Lessons

Modules:

- List of modules with:
  - Name, Description, Status, Cover image.
  - Buttons:
    - Edit module.
    - Assign to courses.

Lessons:

- For a given course/module:
  - Modal or embedded list of lessons:
    - Name, Description.
    - Content type: Text / HTML / Image / Video / MultipleChoice.
    - Content field:
      - For Text: plain text editor.
      - For HTML: WYSIWYG editor (e.g., Quill).
      - For Image/Video: file picker uploading to storage, storing a file ID/URL.
      - For MultipleChoice: form to add question, options, correct answers, explanations.

#### 5.3.4 Admin Education — Programs (`/admin/education/programs`)

- List of programs with:
  - Name, Description, Status (Free/Basic/Pro/Development).
  - Course count, lesson count.
  - Created/updated timestamps.
  - Buttons:
    - Edit program (details).
    - Manage courses (drag‑and‑drop list of courses in the program).

#### 5.3.5 Admin Education — Links (`/admin/education/links`)

- UI to map “locations” (string keys such as “dashboard”, “portfolio”, “companies”, “profile”) to selected courses.
- For each location:
  - Multi-select of courses to show for that location.
- Used to drive which education courses are shown in context on Dashboard, Companies, Portfolio, Profile.

#### 5.3.6 Admin Users / Subscriptions

- Users list (`/admin/users`):
  - Table of users:
    - Name, email, alias, access type, status (active/inactive/suspended).
    - Buttons:
      - View/Impersonate (optional).
      - Change access type.
  - AccessType values:
    - None, User, Pro, Sales, Owner, ContentAdmin, Admin, SuperAdmin, Master.
  - In the new app, these map to Auth0 roles (see Auth0 section below).

- Subscriptions (`/admin/subscriptions`):
  - Table of subscriptions:
    - User, Stripe subscription ID, plan, status, start/renewal dates.
  - Admin can manually adjust membership level if needed (which should sync to Auth0 and DB).

---

## 6. Domain Model & Data Mapping

Define the new database schema to mirror the legacy domain while being Stripe/Auth0‑friendly. Use clear primary keys and foreign keys; the following is a conceptual schema.

### 6.1 Core Entities

#### 6.1.1 User

- `id` (UUID, primary key in new app).
- `auth0_user_id` (string, required; Auth0 subject).
- `alias` (string, unique; matches `@@alias` in profile URLs).
- `first_name`, `last_name`.
- `email`.
- `photo_url` (string).
- `status` (enum: Inactive, Suspended, Active).
- `access_type` (enum mirroring legacy):
  - None, User, Pro, Sales, Owner, ContentAdmin, Admin, SuperAdmin, Master.
- `membership_label` (derived, e.g., “Leyline Free”, “Leyline Basic”, “Leyline Pro”).
- Profile fields:
  - `investment_goals` (array of strings or tags table).
  - `investment_strategies` (array/tags).
  - `investment_preferences` (array/tags).
  - `investment_criteria` (array/tags).
  - `professional_experience` (text).
  - `education` (text).
  - `awards` (text).
  - `is_accredited` (boolean).

#### 6.1.2 Membership & Subscription

- `membership` (logical concept):
  - `level` (Free, Basic, Pro).
  - Derived from:
    - Stripe subscription status, OR
    - Admin override.
  - Persisted in:
    - Auth0 app_metadata (source of truth).
    - Local DB (for querying, caching, and gating).

- `subscription` table:
  - `id` (UUID).
  - `user_id` (FK → User).
  - `stripe_customer_id`.
  - `stripe_subscription_id`.
  - `plan` (enum: Free, Basic, Pro).
  - `status` (enum: Active, Incomplete, PastDue, Canceled, Trialing, etc.).
  - `current_period_start`, `current_period_end`.

#### 6.1.3 Education Entities

Match the existing structure Program → Course → Module → Lesson.

- `education_program`:
  - `id` (int or UUID; can store legacy ID if needed).
  - `status` (Development, Free, Basic, Pro, Deleted).
  - `name`.
  - `description`.
  - `cover_image_url`.

- `education_course`:
  - `id`.
  - `status` (Development, Free, Basic, Pro, Deleted).
  - `name`.
  - `description`.
  - `cover_image_url`.
  - Legacy mapping:
    - Map `EducationCourseStatus` to membership requirement:
      - Free → `UserAccessType.None` (no subscription required).
      - Basic → `UserAccessType.User` (Basic subscription).
      - Pro → `UserAccessType.Pro` (Pro subscription).
      - Development → treat as hidden or admin‑only.

- `education_module`:
  - `id`.
  - `status` (Active/Deleted).
  - `name`.
  - `description`.
  - `cover_image_url` (optional).
  - Sort order within a course.

- `education_lesson`:
  - `id`.
  - `status` (Active/Deleted).
  - `name`.
  - `description`.
  - `content_type` (None, Image, Video, Html, Text, MultipleChoice).
  - `content`:
    - For Html/Text: string HTML/text.
    - For Image/Video: reference to stored file key/URL.
    - For MultipleChoice: JSON structure similar to legacy:
      - `question`, `options` (list with `text`, `isCorrect`, `explanation`), `explanation`.
  - Sort order within a module.

- Relationships:
  - `program_course` (many‑to‑many with an explicit `sort_order`).
  - `course_module` (many‑to‑many with `sort_order`).
  - `module_lesson` (many‑to‑many with `sort_order`) or direct FK with `sort_order`.

- `education_link` (for contextual course suggestions):
  - `location` (string, e.g., “dashboard”, “companies”, “portfolio”, “profile”).
  - `education_course_id` (FK).

#### 6.1.4 User Progress

- `user_education_program`:
  - `user_id`, `program_id`.
  - `percent_completed`.
  - `latest_action_timestamp`.

- `user_education_course`:
  - `user_id`, `course_id`.
  - `percent_completed`.
  - `latest_action_timestamp`.

- `user_education_lesson`:
  - `user_id`, `lesson_id`.
  - `status` (NotStarted, InProgress, Completed).
  - `last_viewed_timestamp`.

> Progress migration from legacy DB is optional and can be a later phase; this plan focuses primarily on course content import.

#### 6.1.5 Portfolio & Companies (High‑Level)

At minimum support the current behaviors:

- `company`:
  - Name, type, notes.
  - Optional tags.

- `investment`:
  - `user_id`, `company_id`.
  - `investment_type` (matching legacy types).
  - `owned` (quantity or %).
  - `shares` (boolean for shares vs %).
  - `mock` (boolean).
  - `value` (computed from transactions or stored).

- `investment_transaction`:
  - `investment_id`.
  - Details of transactions (amount, date, type).

- `investment_reminder`:
  - Linked to investment with content and deadline date.

---

## 7. Auth0 Design

### 7.1 Auth0 Application Setup

- Create a **Regular Web Application** for Leyline.
- Configure callbacks:
  - Development: `http://localhost:3000/api/auth/callback`.
  - Production: `https://[your-domain]/api/auth/callback`.
- Allowed logout URLs: same hosts as above.
- Use `@auth0/nextjs-auth0` SDK in the Next.js app for:
  - `/api/auth/login`.
  - `/api/auth/logout`.
  - `/api/auth/callback`.
  - `/api/auth/me`.

### 7.2 Roles and Membership Mapping

- Define Auth0 roles mirroring `UserAccessType`:
  - `leyline:none`
  - `leyline:user` (Basic).
  - `leyline:pro`
  - `leyline:sales`
  - `leyline:owner`
  - `leyline:content_admin`
  - `leyline:admin`
  - `leyline:super_admin`
  - `leyline:master`

- Keep membership level as a simpler field:
  - `membership_level` in `app_metadata`, with values:
    - `free`, `basic`, `pro`.

- Configure a rule or action to add custom JWT claims:
  - `https://leyline.app/access_type`: one of the `UserAccessType` values.
  - `https://leyline.app/membership_level`: `free` | `basic` | `pro`.
  - `https://leyline.app/roles`: list of roles.

### 7.3 Access Control in Next.js

- Create a wrapper (middleware/HOC) to enforce:
  - Auth required for `(app)` and `(admin)` routes.
  - Additional role checks for admin routes.
- Use membership level and required access per course/program to gate:
  - `Free` content: accessible when membership is `free`, `basic`, or `pro`.
  - `Basic` content: membership `basic` or `pro`.
  - `Pro` content: membership `pro`.

---

## 8. Stripe Billing Design

### 8.1 Stripe Resources

- Products/Prices:
  - `leyline_basic`:
    - Monthly recurring price (and optionally annual).
  - `leyline_pro`:
    - Monthly recurring price (and optionally annual).

- Customer:
  - Map each user to a Stripe customer:
    - Use Auth0 `user_id` and email.

### 8.2 Checkout and Plan Changes

- API routes (Next.js):
  - `POST /api/billing/create-checkout-session`:
    - Input: desired plan (`basic` or `pro`).
    - Creates a Stripe Checkout Session with:
      - `success_url` → `/membership/success?session_id={CHECKOUT_SESSION_ID}`.
      - `cancel_url` → `/membership/cancel`.
    - Associates the session with the Auth0 user ID via metadata.
  - `POST /api/billing/change-plan`:
    - For existing subscribers, updates Stripe subscription to new price.
  - `POST /api/billing/cancel-subscription`:
    - Cancels the subscription at period end or immediately.

### 8.3 Webhooks

- Endpoint: `/api/billing/webhook`.
- Handle events:
  - `customer.subscription.created`.
  - `customer.subscription.updated`.
  - `customer.subscription.deleted`.
  - `invoice.payment_succeeded`.
  - `invoice.payment_failed`.

- On relevant events:
  - Update local `subscription` record.
  - Update Auth0 `membership_level` in `app_metadata`:
    - Basic plan → `membership_level = basic`, `access_type = User`.
    - Pro plan → `membership_level = pro`, `access_type = Pro`.
    - Canceled → `membership_level = free`, `access_type = None` (or downgrade).

### 8.4 Membership Modal UX

- Global modal component accessible from:
  - Membership badge in navbar.
  - Upgrade buttons on Education/Account pages.

- Modal content:
  - Three cards/columns:
    - **Leyline Free**:
      - Price: `$0 / month`.
      - Features: Dashboard, Basic Education Content, Company Research, Portfolio Tracking.
      - CTA: “Continue with Free” (closes modal).
    - **Leyline Basic**:
      - Price: e.g., `$X / month`.
      - Additional features vs Free.
      - CTA: “Upgrade to Basic” → calls `create-checkout-session` with `basic`.
    - **Leyline Pro**:
      - Price: e.g., `$Y / month`.
      - Additional features (advanced courses, etc.).
      - CTA: “Upgrade to Pro” → `create-checkout-session` with `pro`.

---

## 9. Course Export / Import Strategy

The most critical part of the transition is migrating course content.

### 9.1 Legacy Course Export Format (ZIP)

The existing app can export a course as a ZIP archive via a secured endpoint (admin‑only). The new app must import this ZIP.

**Endpoint (legacy app)**:

- `POST /api/education/course/export`
  - Requires admin credentials.
  - Body parameter: `educationCourseId` (integer).
  - Response: `application/zip` file named like:
    - `<course-name>-export-YYYYMMDD.zip`.

**ZIP contents**:

1. **`course.xml`** — main course metadata and structure.
2. **Course and module cover images** as files in folders:
   - Typically under `images/` with original filenames.
3. **Lesson media files** (images and videos):
   - In `images/` or `videos/` folders depending on content type.
4. **`README.txt`** — metadata about the export (course name, counts, missing files, etc.).

#### 9.1.1 `course.xml` Structure

Root element:

```xml
<CourseExport>
  <ExportMetadata ... />
  <Course ... />
  <Modules>
    <Module ...>
      <Lessons>
        <Lesson ...>...</Lesson>
        ...
      </Lessons>
    </Module>
    ...
  </Modules>
  <Files>
    <File ... />
    ...
  </Files>
  <MissingFiles>
    <MissingFile>...</MissingFile>
    ...
  </MissingFiles>
</CourseExport>
```

- `<ExportMetadata>` attributes:
  - `ExportedDate` (UTC timestamp).
  - `ExportedBy` (admin name).
  - `ModuleCount` (number).
  - `LessonCount` (number).
  - `FileCount` (number of files included).

- `<Course>` attributes:
  - `Id` (legacy course ID).
  - `Name`.
  - `Description`.
  - `Status`:
    - `Development`, `Free`, `Basic`, `Pro`, `Deleted`.

- `<Modules>`:
  - Contains multiple `<Module>` elements, each with attributes:
    - `Id` (legacy module ID).
    - `Name`.
    - `Description`.
    - `Status` (e.g., `Active`, `Deleted`).
  - Each `<Module>` has a `<Lessons>` child.

- `<Lessons>`:
  - Contains `<Lesson>` elements with attributes:
    - `Id` (legacy lesson ID).
    - `Name`.
    - `Description`.
    - `ContentType`:
      - `Html`, `Text`, `Image`, `Video`, `MultipleChoice`, `None`.
    - `Status` (e.g., `Active`, `Deleted`).
    - If the lesson uses a file:
      - `ContentFileId` = GUID of the file.
      - `ContentFileName` = original filename (if known).
  - Lesson content:
    - For `Html` or `Text` content:
      - The lesson content is stored as a CDATA section inside `<Lesson>`, containing full HTML or text.
    - For `Image` or `Video`:
      - The content attribute is a GUID; the actual binary file is present in the ZIP under `images/` or `videos/`, referenced in `<Files>`.

- `<Files>` section:
  - Multiple `<File>` elements with attributes:
    - `Id` (GUID).
    - `FileName`.
    - `ContentType` (MIME type).
    - `Size` (bytes).

- `<MissingFiles>` (optional):
  - Zero or more `<MissingFile>` elements containing text descriptions of files that could not be included (e.g., due to storage issues).

### 9.2 New Importer Design (Next.js / Node)

Implement a backend import tool (can be:

- A dedicated Next.js API route accessible only to admins, OR
- A separate Node CLI script that runs offline using DB access.

Recommended: a CLI script for bulk migration, plus a simple admin UI wrapper if needed.

#### 9.2.1 Import Steps

For each exported course ZIP:

1. **Upload ZIP**:
   - Admin uploads ZIP via admin UI or places it in a folder for CLI.

2. **Extract**:
   - Unzip archive to a temporary directory.
   - Locate `course.xml`.

3. **Parse `course.xml`**:
   - Parse the XML document.
   - Extract course fields:
     - Name, Description, Status.
   - Extract modules list:
     - Name, Description, Status.
   - Extract lessons for each module:
     - Name, Description, ContentType, Status.
     - For Html/Text: lesson content from CDATA.
     - For Image/Video: `ContentFileId`, `ContentFileName`, and match to `<File>` section to get MIME type and size.

4. **Map to new DB**:
   - Create a new `education_course` record:
     - `name`, `description`, `status`.
     - Map legacy `Status` to new status and membership requirement:
       - `Free` → status Free, required membership: `free`.
       - `Basic` → status Basic, required membership: `basic`.
       - `Pro` → status Pro, required membership: `pro`.
       - `Development` → status Development (hidden from regular users).
   - For each module:
     - Create `education_module` with sort order based on original order.
   - For each lesson:
     - Create `education_lesson` with:
       - Name, description, content_type.
       - Content:
         - For Html/Text: store content as HTML/text in DB.
         - For Image/Video:
           - Upload the file from `images/` or `videos/` to the new storage provider.
           - Store resulting URL or storage key in `content`.
         - For MultipleChoice:
           - If encoded as HTML/text in the original, parse and convert to structured JSON if desired.

5. **Program relationships (optional)**:
   - Legacy export includes only a course and its modules/lessons.
   - If programs are important:
     - Either create default programs per course, or
     - Create separate program export/import functionality later and map courses into programs.

6. **Validation**:
   - Ensure counts of modules, lessons, and files match metadata.
   - Log any missing files (from `<MissingFiles>` or missing physical files).

7. **Idempotency**:
   - Decide how to treat re‑imports:
     - Option A: create a new course each time (simpler).
     - Option B: detect existing course by name and update it (more complex).

### 9.3 Admin Import UI

Implement an admin page under `/admin/education/courses`:

- “Import Course” button:
  - Opens a modal or page with:
    - File upload control for course ZIP.
    - Import options:
      - Import mode: Create new / Update existing (if matching by name).
  - On submit:
    - Calls import API or triggers CLI process.
  - Show import log summary:
    - Created modules, lessons.
    - Any missing files or errors.

---

## 10. Implementation Phases & Checklist

### Phase 1 — Skeleton & Infrastructure

- [ ] Initialize Next.js app with TypeScript and Tailwind.
- [ ] Configure base layouts: public, main, admin.
- [ ] Set up routing structure for all major pages (stubs).
- [ ] Configure Auth0 SDK and environment variables.
- [ ] Configure Stripe SDK and environment variables.
- [ ] Set up database (PostgreSQL) and ORM (Prisma).
- [ ] Create initial Prisma schema for core entities (User, Subscription, EducationProgram/Course/Module/Lesson, Company, Investment).
- [ ] Deploy skeleton app to Vercel (with health‑check page).

### Phase 2 — Auth & User Model

- [ ] Implement login/register/logout flows via Auth0.
- [ ] Implement Auth0 Actions/Rules to include custom claims (`access_type`, `membership_level`, roles).
- [ ] Implement middleware to protect authenticated and admin routes.
- [ ] Map Auth0 user to local `User` record on first login.
- [ ] Implement Profile and Account pages reading data from both Auth0 and DB.

### Phase 3 — Stripe Billing & Membership

- [ ] Create Stripe products/prices for Basic and Pro.
- [ ] Implement `create-checkout-session`, `change-plan`, and `cancel-subscription` API routes.
- [ ] Implement Stripe webhook handler to sync membership and subscription state.
- [ ] Update Auth0 app_metadata from webhook events (via Management API).
- [ ] Implement Membership modal with plans and CTAs wired to Stripe.
- [ ] Implement `/account/subscriptions` page reflecting current membership and allowing cancellation/upgrade.

### Phase 4 — Education Domain & UI

- [ ] Implement DB models for programs, courses, modules, lessons, links, and user progress.
- [ ] Build `/education` page with course cards and membership gating.
- [ ] Build `/education/course/[id-slug]` page with outline, lesson content, and progress tracking.
- [ ] Build `/education/program/[id-slug]` page with nested outline.
- [ ] Implement contextual links (dashboard, companies, portfolio, profile) using `education_link`.

### Phase 5 — Course Importer

- [ ] Implement Node script or API route to:
  - [ ] Accept course export ZIP.
  - [ ] Parse `course.xml`.
  - [ ] Import course/modules/lessons into DB.
  - [ ] Upload media files to storage and link them.
  - [ ] Log and handle missing files.
- [ ] Build admin UI to upload ZIP and trigger importer.
- [ ] Test import with sample exports from legacy app.
- [ ] Verify imported courses render correctly in `/education` and detail pages.

### Phase 6 — Portfolio, Companies, Dashboard

- [ ] Implement Companies CRUD UI and modals.
- [ ] Implement Portfolio list and investment detail pages with modals for investments and transactions.
- [ ] Implement Dashboard data aggregation (investments, mock investments, education progress, reminders).
- [ ] Implement charts using Chart.js (or similar) to match existing portfolio chart.

### Phase 7 — Admin Area

- [ ] Implement admin sidenav and layout.
- [ ] Implement Users list (read‑only first, then editing of access type).
- [ ] Implement Registration and Invitations management.
- [ ] Implement Education admin pages (Programs, Courses, Modules, Links) with drag‑and‑drop for ordering.
- [ ] Implement Subscriptions and Transactions views (reading from Stripe and local DB).
- [ ] Implement Settings page for app configuration (feature toggles, etc.).

### Phase 8 — Polishing & Parity

- [ ] Fine‑tune Tailwind theme to match original colors, typography, and spacing.
- [ ] Implement membership badge and status indicators everywhere they appear in the legacy app.
- [ ] Validate all URLs and flows match legacy expectations (login → dashboard, profile → edit, etc.).
- [ ] Add basic analytics (Google Analytics or equivalent).
- [ ] Harden security (rate limiting, CSRF where applicable, proper auth/role checks).

---

## 11. Environment & Configuration Checklist

- Vercel env vars:
  - `AUTH0_SECRET`
  - `AUTH0_BASE_URL`
  - `AUTH0_ISSUER_BASE_URL`
  - `AUTH0_CLIENT_ID`
  - `AUTH0_CLIENT_SECRET`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `DATABASE_URL`
  - Storage credentials (e.g., `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION`).

- Other:
  - Domain configuration (custom domain on Vercel).
  - HTTPS/SSL is handled by Vercel automatically.

---

## 12. Notes & Assumptions

- Existing **user progress and portfolio data** can be migrated later via custom scripts; this plan focuses on course content as the highest priority.
- Membership level is intentionally controlled by Stripe + Auth0; the Next.js app should treat Auth0 as the source of truth for `access_type` and `membership_level`.
- During transition, both legacy and new apps may run in parallel; ensure that:
  - Course content is exported once and imported into the new system.
  - Users are clearly directed to the new app once it is ready.

This plan should give another coding agent enough detail to build the new Leyline app from scratch and to import existing courses while preserving the current UX and layout. 

