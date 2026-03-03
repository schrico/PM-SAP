-- Fix realtime cross-user event delivery by ensuring all authenticated users
-- can SELECT from the tables subscribed to via Supabase Realtime postgres_changes.
--
-- Supabase Realtime applies RLS per subscriber: before delivering a change event
-- to a connected client, Supabase executes a SELECT on the changed row using that
-- client's JWT. If the client's RLS policy doesn't permit SELECT on that row, the
-- event is silently dropped — never delivered to the client's browser.
--
-- Root cause: projects and projects_assignment had user-scoped SELECT policies,
-- so User B's browser never received events for rows owned/assigned to User A.
-- This is why realtime only worked within the same session, not across accounts.
--
-- Reference: https://supabase.com/docs/guides/realtime/postgres-changes#rls-and-realtime
-- "every change event must be checked to see if the subscribed user has access"
--
-- This fix matches the pattern already working correctly on sap_import_status,
-- which uses USING (auth.uid() IS NOT NULL) and receives events on all clients.
--
-- Write security is NOT affected — INSERT/UPDATE/DELETE policies are unchanged.

-- ── projects ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read projects" ON public.projects;

CREATE POLICY "Authenticated users can read projects"
  ON public.projects FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── projects_assignment ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can read project assignments" ON public.projects_assignment;

CREATE POLICY "Authenticated users can read project assignments"
  ON public.projects_assignment FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Ensure both tables are published to the supabase_realtime publication.
-- Safe to run even if already added — Postgres ignores duplicate table entries.
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects_assignment;
