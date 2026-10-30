-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- Publishing is limited to module app roles. See docs/adr/0012.
CREATE OR REPLACE FUNCTION outbox.append_event(
  p_id             uuid,
  p_type           text,
  p_version        integer,
  p_source_version bigint,
  p_trace_id       text,
  p_occurred_at    timestamptz,
  p_family_id      uuid,
  p_user_id        uuid,
  p_payload        jsonb
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, outbox
AS $fn$
DECLARE
  seq bigint;
BEGIN
  IF session_user !~ '_app$' OR session_user = 'outbox_app' THEN
    RAISE EXCEPTION 'only a module role may publish an event';
  END IF;
  INSERT INTO outbox.event (
    id, type, version, source_version, trace_id, occurred_at, family_id, user_id, payload
  ) VALUES (
    p_id, p_type, p_version, p_source_version, p_trace_id, p_occurred_at, p_family_id, p_user_id, p_payload
  )
  RETURNING sequence INTO seq;
  PERFORM pg_notify('outbox_event', seq::text);
  RETURN seq;
END;
$fn$;
