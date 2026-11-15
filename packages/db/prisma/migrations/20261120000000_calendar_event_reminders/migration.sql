-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM calendar.event_reminder) THEN
    RAISE EXCEPTION 'calendar.event_reminder has rows; backfill offset_minutes before adding it';
  END IF;
END $$;

ALTER TABLE calendar.event_reminder
  ADD COLUMN offset_minutes integer NOT NULL CHECK (offset_minutes BETWEEN 0 AND 40320),
  ADD COLUMN fired_at timestamptz NULL,
  ADD COLUMN skipped_at timestamptz NULL,
  ADD CONSTRAINT event_reminder_fired_xor_skipped CHECK (fired_at IS NULL OR skipped_at IS NULL),
  ADD CONSTRAINT event_reminder_single_owner CHECK (num_nonnulls(family_id, user_id) = 1);

CREATE UNIQUE INDEX event_reminder_event_user_offset_key
  ON calendar.event_reminder (event_id, user_id, offset_minutes);

CREATE INDEX event_reminder_due_idx
  ON calendar.event_reminder (remind_at)
  WHERE fired_at IS NULL AND skipped_at IS NULL;

DROP POLICY event_reminder_family_member_access ON calendar.event_reminder;

CREATE POLICY event_reminder_own_access ON calendar.event_reminder
  FOR ALL
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE FUNCTION calendar.caller_can_write_event(p_event_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM calendar.calendar_event e
    WHERE e.event_id = p_event_id
      AND calendar.caller_can_write_calendar(e.calendar_id)
  );
$$;

REVOKE ALL ON FUNCTION calendar.caller_can_write_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calendar.caller_can_write_event(uuid) TO offgrid_app;

CREATE POLICY event_reminder_event_writer_delete ON calendar.event_reminder
  FOR DELETE
  USING (calendar.caller_can_write_event(event_id));

CREATE FUNCTION calendar.user_can_see_event(p_user_id uuid, p_event_id uuid)
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
        (e.user_id IS NOT NULL AND e.user_id = p_user_id)
        OR (e.family_id IS NOT NULL AND e.family_id IN (
          SELECT f.family_id FROM calendar.family_membership f
          WHERE f.user_id = p_user_id AND f.is_member
        ))
      )
  ) OR EXISTS (
    SELECT 1 FROM calendar.event_guest g
    WHERE g.event_id = p_event_id AND g.guest_user_id = p_user_id
  );
$$;

REVOKE ALL ON FUNCTION calendar.user_can_see_event(uuid, uuid) FROM PUBLIC;

CREATE FUNCTION calendar.claim_due_reminders(p_now timestamptz, p_batch integer)
RETURNS TABLE (reminder_id uuid, event_id uuid, user_id uuid)
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  UPDATE calendar.event_reminder r
  SET fired_at = p_now
  WHERE r.reminder_id IN (
    SELECT d.reminder_id FROM calendar.event_reminder d
    WHERE d.fired_at IS NULL
      AND d.skipped_at IS NULL
      AND d.user_id IS NOT NULL
      AND d.remind_at <= p_now
      AND calendar.user_can_see_event(d.user_id, d.event_id)
    ORDER BY d.remind_at
    LIMIT p_batch
    FOR UPDATE SKIP LOCKED
  )
  RETURNING r.reminder_id, r.event_id, r.user_id;
$$;

REVOKE ALL ON FUNCTION calendar.claim_due_reminders(timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calendar.claim_due_reminders(timestamptz, integer) TO offgrid_app;
