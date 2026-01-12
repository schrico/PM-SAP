
# Technology Stack Rules

This project follows a specific technology stack. Always use these technologies and patterns:

## Core Framework
- **Next.js + TypeScript** - Core framework with TypeScript for type safety
- **proxy.ts** - Use for authentication, routing, and security middleware

## Database & Authentication
- **Supabase** - For data, authentication, and storage
- Use Supabase client for all database operations
- Implement proper authentication flows with Supabase Auth

## Database Schema
The project uses the following Supabase tables:

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.avatars (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  filename text NOT NULL UNIQUE,
  display_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT avatars_pkey PRIMARY KEY (id)
);
CREATE TABLE public.color_settings (
  id bigint NOT NULL DEFAULT nextval('color_settings_id_seq'::regclass),
  setting_key character varying NOT NULL UNIQUE,
  color_value text NOT NULL,
  category character varying NOT NULL CHECK (category::text = ANY (ARRAY['system'::character varying, 'language'::character varying, 'status'::character varying]::text[])),
  system_name character varying,
  status_key character varying,
  language_in character varying,
  language_out character varying,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT color_settings_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text NOT NULL,
  final_deadline timestamp with time zone,
  words integer,
  system text NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'active'::project_status,
  instructions text DEFAULT 'Sem descrição fornecida'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  paid boolean DEFAULT false,
  invoiced boolean DEFAULT false,
  lines smallint,
  language_in text,
  language_out text,
  short boolean,
  initial_deadline timestamp with time zone,
  interim_deadline timestamp with time zone,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.projects_assignment (
  project_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  assignment_status USER-DEFINED DEFAULT 'unclaimed'::assignment_status,
  initial_message text,
  refusal_message text,
  done_message text,
  CONSTRAINT projects_assignment_pkey PRIMARY KEY (project_id, user_id),
  CONSTRAINT projects_assignment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT projects_assignment_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  name text DEFAULT 'Sem nome :'::text,
  email text NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'employee'::user_role,
  TE_user text UNIQUE,
  C_user text UNIQUE,
  short_name text DEFAULT ''::text UNIQUE CHECK (length(short_name) < 10),
  avatar text UNIQUE,
  custom_avatar text,
  theme_preference USER-DEFINED DEFAULT 'system'::theme,/
  words_per_hour integer DEFAULT 500,
  lines_per_hour integer DEFAULT 50,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

## Project Context
This is a small-team web application built with Next.js and Supabase.
Simplicity, clarity, and long-term maintainability are more important than abstraction or cleverness.

Assume:
- Few developers
- Frequent iteration
- Preference for boring, explicit solutions

---

## Domain Enums (Authoritative)
These enums define core business logic and must be respected across UI, API, and database.

### project_status
- active
- complete
- cancelled

Used for project lifecycle, filtering, and permissions.

### assignment_status
- unclaimed
- claimed
- done
- rejected

Used to manage task ownership and workflow state.

### user_role
- admin
- pm
- employee

Authorization rules:
- admin: full access
- pm: manage projects and assignments
- employee: view and work on assigned projects only

### theme
- system
- light
- dark

UI preference only.

---

## Database Triggers (Critical Side Effects)
The database mutates data automatically via triggers.  
Do NOT duplicate or bypass this logic in the application.

### public.projects
- `update_projects_updated_at`
  - Automatically updates `updated_at` on every update.

### public.users
- `update_users_updated_at`
  - Automatically updates `updated_at`.

### auth.users
- `handle_new_user`
- `handle_user_update`
- `handle_user_delete`

These keep `auth.users` and `public.users` in sync.
Application code must assume this sync already happens.

---

## Security & Authorization
- Row Level Security (RLS) is authoritative.
- Auth helper functions (`auth.uid()`, `auth.role()`, `auth.jwt()`) are used by RLS.
- Some database functions run as `SECURITY DEFINER`.

Do not reimplement authorization rules in frontend or API logic.
Respect database constraints.

---

## Performance & Query Design
Indexes exist to support common access patterns.

### public.projects
- Indexed by `deadline`
  - Sorting and filtering by deadline is expected and efficient.

### projects_assignment
- Indexed by `project_id`
- Indexed by `user_id`

Use these for:
- "My Projects" views
- Project detail pages
- User → assigned work queries

Avoid unindexed cross-table scans.

---

## Out of Scope / Treat as Black Box
Do not design features or refactors around these:

- Supabase internal schemas: `auth`, `storage`, `realtime`, `vault`, `extensions`
- OAuth, MFA, JWT internals
- Realtime internals
- Storage bucket internals

Assume these work as provided by Supabase.

---

## Design Principles
- Prefer deletion over abstraction.
- Prefer explicit code over reusable-but-unclear patterns.
- Components should exist only if reused meaningfully.
- Optimize for developer velocity, not theoretical flexibility.

When in doubt: make it simpler.


### Database Guidelines
- Always use proper TypeScript types that match the database schema
- Use Zod schemas for validating data from Supabase
- Implement proper error handling for database operations
- Use React Query for caching and managing database state
- Follow Supabase best practices for RLS (Row Level Security) when needed

## Styling & UI
- **Tailwind CSS** - For styling and responsive design
- **shadcn/ui** - Modern UI component library
- Use shadcn/ui components instead of custom UI components when possible

## State Management
- **Zustand** - Lightweight global state management
- Use Zustand for client-side state that needs to be shared across components

## Date Handling
- **date-fns** - For all date manipulation and formatting
- Avoid using native Date methods, use date-fns utilities

## Validation
- **Zod** - For schema validation and runtime type checking
- Use Zod schemas for form validation and API data validation

## Forms
- **React Hook Form** - For form handling
- Integrate React Hook Form with Zod for validation
- Use proper form patterns with error handling

## Data Fetching
- **React Query (TanStack Query)** - For server state management
- Use React Query for all API calls, caching, and refetching
- Implement proper loading states and error handling

## Icons
- **lucide-react** - For all icon needs
- Use lucide-react icons consistently throughout the application

## Code Quality
- **ESLint + Prettier** - For code linting and formatting
- Follow consistent code style and formatting rules
- Use proper TypeScript types and avoid `any`

## Environment Configuration
- **Next.js env system** - For environment variables
- Use proper environment variable naming conventions
- Implement secure configuration management

## Implementation Guidelines
- Always use TypeScript with proper typing
- Follow Next.js 16 best practices for routing and API routes and in general use mcp if needed
- Implement proper error boundaries and loading states
- Use React Query for all data fetching operations
- Validate all data with Zod schemas
- Use Tailwind for styling with shadcn/ui components
- Implement proper authentication flows with Supabase
- Follow consistent file structure and naming conventions
