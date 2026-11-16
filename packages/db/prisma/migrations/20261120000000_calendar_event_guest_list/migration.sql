-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- A guest lists the other guests of an event they are invited to. The function is
-- SECURITY DEFINER so it reads event_guest without the row policies, and it answers only
-- for the caller's own invitation, so no other row is exposed.
CREATE FUNCTION calendar.caller_is_guest_of(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM calendar.event_guest g
    WHERE g.event_id = p_event_id
      AND g.guest_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      AND calendar.shares_family_with_caller(g.user_id)
  );
$$;

REVOKE ALL ON FUNCTION calendar.caller_is_guest_of(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calendar.caller_is_guest_of(uuid) TO offgrid_app;

CREATE POLICY event_guest_fellow_guest_read ON calendar.event_guest
  FOR SELECT
  USING (calendar.caller_is_guest_of(event_id));
