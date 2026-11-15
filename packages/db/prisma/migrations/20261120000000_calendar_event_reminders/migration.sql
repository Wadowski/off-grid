-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- One row per (event, creator, offset). The row is both the schedule and the state of one
-- reminder: fired_at is set when the worker claims it, skipped_at when it was set in the past.
-- The calendar module is not released, so the column is added only to an empty table.
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
  ADD CONSTRAINT event_reminder_fired_xor_skipped CHECK (fired_at IS NULL OR skipped_at IS NULL);

CREATE UNIQUE INDEX event_reminder_event_user_offset_key
  ON calendar.event_reminder (event_id, user_id, offset_minutes);

CREATE INDEX event_reminder_due_idx
  ON calendar.event_reminder (remind_at)
  WHERE fired_at IS NULL AND skipped_at IS NULL;

-- Privacy: a reminder is private to its creator. Family membership is still required for
-- family-owned events, so removing a member also removes their access.
DROP POLICY event_reminder_family_member_access ON calendar.event_reminder;

CREATE POLICY event_reminder_own_access ON calendar.event_reminder
  FOR ALL
  USING (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND (family_id IS NULL OR family_id IN (
      SELECT f.family_id FROM calendar.family_membership f
      WHERE f.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND f.is_member
    ))
  )
  WITH CHECK (
    user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    AND (family_id IS NULL OR family_id IN (
      SELECT f.family_id FROM calendar.family_membership f
      WHERE f.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND f.is_member
    ))
  );

-- Deleting an event removes every reminder of that event, including other people's rows
-- (for example a guest's). Only a caller who can write the event's calendar may do that.
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

-- The worker reads across users, so it cannot run under the row policies. This function is the
-- only exception: it claims due rows atomically, marks them fired, and returns ids only.
-- It is recorded in ADR 0030.
CREATE FUNCTION calendar.claim_due_reminders(p_now timestamptz, p_batch integer)
RETURNS TABLE (reminder_id uuid, event_id uuid, user_id uuid, family_id uuid)
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = calendar, pg_temp
AS $$
  UPDATE calendar.event_reminder r
  SET fired_at = p_now
  WHERE r.reminder_id IN (
    SELECT d.reminder_id FROM calendar.event_reminder d
    WHERE d.fired_at IS NULL AND d.skipped_at IS NULL AND d.remind_at <= p_now
    ORDER BY d.remind_at
    LIMIT p_batch
    FOR UPDATE SKIP LOCKED
  )
  RETURNING r.reminder_id, r.event_id, r.user_id, r.family_id;
$$;

REVOKE ALL ON FUNCTION calendar.claim_due_reminders(timestamptz, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION calendar.claim_due_reminders(timestamptz, integer) TO offgrid_app;
