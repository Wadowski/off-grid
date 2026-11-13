-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE FUNCTION calendar.caller_can_see_event(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM calendar.calendar_event e
    WHERE e.event_id = p_event_id
      AND (
        (e.user_id IS NOT NULL AND e.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
        OR (e.family_id IS NOT NULL AND e.family_id IN (
          SELECT f.family_id FROM calendar.family_membership f
          WHERE f.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND f.is_member
        ))
      )
  );
$$;

CREATE FUNCTION calendar.caller_can_write_calendar(p_calendar_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM calendar.calendar c
    WHERE c.calendar_id = p_calendar_id
      AND (
        (c.user_id IS NOT NULL AND c.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
        OR (c.family_id IS NOT NULL AND (
          c.family_id = NULLIF(current_setting('app.family_id', true), '')::uuid
          OR c.family_id IN (
            SELECT f.family_id FROM calendar.family_membership f
            WHERE f.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND f.is_member
          )
        ))
      )
  );
$$;

DROP POLICY calendar_event_scope ON calendar.calendar_event;

CREATE POLICY calendar_event_scope ON calendar.calendar_event
  USING (
    (family_id IS NOT NULL AND family_id = NULLIF(current_setting('app.family_id', true), '')::uuid)
    OR (user_id IS NOT NULL AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  )
  WITH CHECK (
    (
      (family_id IS NOT NULL AND family_id = NULLIF(current_setting('app.family_id', true), '')::uuid)
      OR (user_id IS NOT NULL AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
    )
    AND calendar.caller_can_write_calendar(calendar_id)
  );

CREATE FUNCTION calendar.shares_family_with_caller(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM calendar.family_membership caller_row
    JOIN calendar.family_membership other_row ON other_row.family_id = caller_row.family_id
    WHERE caller_row.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      AND caller_row.is_member
      AND other_row.user_id = p_user_id
      AND other_row.is_member
  );
$$;

CREATE POLICY calendar_event_guest_read ON calendar.calendar_event
  FOR SELECT
  USING (event_id IN (
    SELECT event_id FROM calendar.event_guest
    WHERE guest_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
  ));

CREATE POLICY calendar_guest_read ON calendar.calendar
  FOR SELECT
  USING (calendar_id IN (
    SELECT calendar_id FROM calendar.calendar_event
    WHERE event_id IN (
      SELECT event_id FROM calendar.event_guest
      WHERE guest_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  ));

CREATE POLICY event_guest_own_row ON calendar.event_guest
  FOR SELECT
  USING (guest_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- The owner and family insert checks on event_guest now also require the event to be
-- visible to the caller. Guests match no owner or family policy, so their writes return no rows.

DROP POLICY event_guest_scope ON calendar.event_guest;

CREATE POLICY event_guest_scope ON calendar.event_guest
  USING (
    (family_id IS NOT NULL AND family_id = NULLIF(current_setting('app.family_id', true), '')::uuid)
    OR (user_id IS NOT NULL AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  )
  WITH CHECK (
    (
      (family_id IS NOT NULL AND family_id = NULLIF(current_setting('app.family_id', true), '')::uuid)
      OR (user_id IS NOT NULL AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
    )
    AND calendar.caller_can_see_event(event_id)
  );

DROP POLICY event_guest_family_member_access ON calendar.event_guest;

CREATE POLICY event_guest_family_member_access ON calendar.event_guest
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member))
  WITH CHECK (
    family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member)
    AND calendar.caller_can_see_event(event_id)
  );
