
# Technology Stack

- **Next.js 16 + TypeScript** — App Router, strict mode, `@/*` path alias
- **Supabase** — Database, Auth (email/password), Storage, Realtime
- **Tailwind CSS + shadcn/ui** (new-york style) — prefer shadcn components over custom
- **Zustand** — client-side shared state
- **React Query (TanStack v5)** — all server state, caching, refetching
- **React Hook Form + Zod** — forms and validation
- **date-fns** — all date manipulation; avoid native Date methods
- **lucide-react** — all icons
- **proxy.ts** — auth, routing, security middleware

---

## Project Context

Small-team web app. Simplicity and maintainability over abstraction. Few developers, frequent iteration, preference for boring and explicit solutions.

---

## Database Schema

### Tables (key columns only)

| Table | Key Columns |
|-------|-------------|
| `projects` | `id`, `name`, `system` (text, not null), `status` (project_status), `api_source` (text: 'manual'\|'TPM_sap_api'\|'XTM_sap_api'), `language_in`, `language_out`, `final_deadline`, `initial_deadline`, `interim_deadline`, `words`, `lines`, `hours`, `paid`, `invoiced`, `instructions` (custom), `sap_instructions` (jsonb), `sap_subproject_id`, `sap_import_key`, `sap_pm`, `project_type`, `translation_area[]`, `work_list[]`, `terminology_key[]`, `lxe_projects[]`, `graph_id[]`, `url`, `project_notes`, `updated_at` |
| `projects_assignment` | `project_id`, `user_id` (composite PK), `assignment_status`, `initial_message`, `refusal_message`, `done_message` |
| `users` | `id` (uuid), `name`, `email`, `role` (user_role), `short_name` (<10 chars), `avatar`, `custom_avatar`, `TE_user`, `C_user`, `theme_preference`, `words_per_hour` (default 500), `lines_per_hour` (default 50) |
| `avatars` | `id`, `filename` (unique), `display_name` |
| `color_settings` | `id`, `setting_key` (unique), `color_value`, `category` ('system'\|'language'\|'status'), `system_name`, `status_key`, `language_in`, `language_out` |
| `default_filters` | `id`, `user_id` (unique), `filter_key` (unique), `included_values[]`, `excluded_values[]` |
| `import_reports` | `id`, `report_type`, `triggered_by` (uuid), `new_projects` (jsonb[]), `modified_projects` (jsonb[]), `acknowledged_by` (uuid[]), `summary` (text) |
| `instruction_exclusions` | `id`, `user_id` (unique), `instruction_text` (unique) |
| `sap_import_status` | `id` (always 1), `status` ('idle'\|'running'\|'failed'), `started_at`, `finished_at`, `started_by`, `last_error` |
| `sap_api_rate_limits` | `user_id`, `last_fetch_at` |

### Key Indexes
- `projects`: indexed on `final_deadline`, `sap_subproject_id`, `api_source`, composite `(sap_subproject_id, sap_import_key)`
- `projects_assignment`: indexed on `project_id` and `user_id`

---

## Domain Enums (Authoritative)

### project_status
- `active`, `complete`, `cancelled`

### assignment_status
- `unclaimed`, `claimed`, `done`, `rejected`

### user_role
- `admin` — full access
- `pm` — manage projects and assignments
- `employee` — view and work on assigned projects only

### theme
- `system`, `light`, `dark` (UI preference only)

---

## Database Triggers (Critical — Do Not Duplicate)

- `projects` → `update_projects_updated_at`: auto-updates `updated_at` on every row update
- `users` → `update_users_updated_at`: same
- `auth.users` → `handle_new_user`, `handle_user_update`, `handle_user_delete`: keep `auth.users` ↔ `public.users` in sync; assume this always works

---

## Security & Authorization

- RLS is authoritative. Do not reimplement authorization in frontend or API logic.
- `auth.uid()`, `auth.role()`, `auth.jwt()` used by RLS policies.
- Some DB functions run as `SECURITY DEFINER`.
- Treat `auth`, `storage`, `realtime`, `vault` schemas as black boxes.

---

## Performance & Query Design

- Filter/sort on `final_deadline` is efficient (indexed).
- Use `project_id` and `user_id` indexes on `projects_assignment` for "My Projects" and project detail queries.
- Avoid unindexed cross-table scans.

---

## Design Principles

- Prefer deletion over abstraction.
- Prefer explicit code over reusable-but-unclear patterns.
- Components should exist only if reused meaningfully.
- Optimize for developer velocity, not theoretical flexibility.
- When in doubt: make it simpler.
- TypeScript types must match the DB schema; use Zod for validation; use React Query for all data fetching; use proper error handling.

---

## Key Architectural Patterns

### Role-Based Access Control
- RLS at DB level; `RoleGuard` wraps protected pages; `useRoleAccess` provides memoized checks
- Sidebar and home cards are role-filtered

### Concurrency Safety
- `useConcurrencySafeMutation` implements optimistic locking via `updated_at` timestamp
- Field-level conflicts surfaced via `ConflictResolutionModal`; during-edit warning via `EditConflictModal`

### SAP Import Pipeline
- OAuth password grant, token caching (60s buffer), 3 retries
- Distributed lock via `sap_import_status` table; per-user rate limit via `sap_api_rate_limits`
- Project matching: primary `sap_subproject_id + sap_import_key`; fallback legacy match
- Import reports broadcast via Supabase Realtime → `ImportReportNotifier` auto-surfaces them

### Realtime Updates
- `RealtimeProvider` subscribes to 4 channels: `projects`, `projects_assignment`, `import_reports`, `sap_import_status`
- Each channel invalidates the relevant React Query caches

### Color System
- Centralized in `color_settings` table (categories: system, language, status)
- `useColorSettings` provides `getSystemColor`, `getStatusColor`, `getLanguageColor`
- Tailwind safelist dynamically generated from `tailwindColors.ts`

---

## Project Structure

See `memory/project-structure.md` for the full directory tree, data flow diagrams, and file-by-file reference.
