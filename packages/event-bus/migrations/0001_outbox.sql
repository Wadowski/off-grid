-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE outbox.event (
  sequence       bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id             uuid        NOT NULL UNIQUE,
  type           text        NOT NULL CHECK (char_length(type) BETWEEN 1 AND 128),
  version        integer     NOT NULL CHECK (version >= 1),
  source_version bigint      NOT NULL CHECK (source_version >= 1),
  trace_id       text        NOT NULL CHECK (char_length(trace_id) BETWEEN 1 AND 128),
  occurred_at    timestamptz NOT NULL,
  family_id      uuid,
  user_id        uuid,
  payload        jsonb       NOT NULL,
  published_at   timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('outbox', 'event', 'family-or-user');

CREATE TABLE outbox.subscriber_cursor (
  subscriber    text   PRIMARY KEY CHECK (char_length(subscriber) BETWEEN 1 AND 128),
  last_sequence bigint NOT NULL DEFAULT 0 CHECK (last_sequence >= 0)
);
SELECT public.offgrid_declare_scope('outbox', 'subscriber_cursor', 'shared');

CREATE TABLE outbox.dead_letter (
  id             bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subscriber     text        NOT NULL,
  event_sequence bigint      NOT NULL,
  event_id       uuid        NOT NULL,
  event_type     text        NOT NULL,
  attempts       integer     NOT NULL CHECK (attempts >= 1),
  error_name     text        NOT NULL CHECK (char_length(error_name) BETWEEN 1 AND 128),
  family_id      uuid,
  user_id        uuid,
  failed_at      timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('outbox', 'dead_letter', 'family-or-user');

CREATE FUNCTION outbox.append_event(
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

CREATE FUNCTION outbox.lock_cursor(p_subscriber text) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, outbox
AS $fn$
DECLARE
  position bigint;
BEGIN
  INSERT INTO outbox.subscriber_cursor (subscriber) VALUES (p_subscriber)
  ON CONFLICT (subscriber) DO NOTHING;
  SELECT last_sequence INTO position
    FROM outbox.subscriber_cursor
   WHERE subscriber = p_subscriber
     FOR UPDATE SKIP LOCKED;
  RETURN position;
END;
$fn$;

CREATE FUNCTION outbox.advance_cursor(p_subscriber text, p_sequence bigint) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, outbox
AS $fn$
  UPDATE outbox.subscriber_cursor
     SET last_sequence = p_sequence
   WHERE subscriber = p_subscriber
     AND last_sequence < p_sequence;
$fn$;

CREATE FUNCTION outbox.events_after(p_after bigint, p_type text, p_limit integer)
RETURNS SETOF outbox.event
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, outbox
AS $fn$
  SELECT *
    FROM outbox.event
   WHERE sequence > p_after
     AND (p_type IS NULL OR type = p_type)
   ORDER BY sequence
   LIMIT p_limit;
$fn$;

CREATE FUNCTION outbox.record_dead_letter(
  p_subscriber text,
  p_sequence   bigint,
  p_attempts   integer,
  p_error_name text
) RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, outbox
AS $fn$
  INSERT INTO outbox.dead_letter (
    subscriber, event_sequence, event_id, event_type, attempts, error_name, family_id, user_id
  )
  SELECT p_subscriber, sequence, id, type, p_attempts, p_error_name, family_id, user_id
    FROM outbox.event
   WHERE sequence = p_sequence;
$fn$;

CREATE FUNCTION outbox.prune_delivered(p_retention_seconds integer) RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, outbox
AS $fn$
  WITH deleted AS (
    DELETE FROM outbox.event
     WHERE published_at < now() - make_interval(secs => p_retention_seconds)
       AND sequence <= (SELECT coalesce(min(last_sequence), 0) FROM outbox.subscriber_cursor)
    RETURNING 1
  )
  SELECT count(*) FROM deleted;
$fn$;

REVOKE ALL ON FUNCTION outbox.append_event(uuid, text, integer, bigint, text, timestamptz, uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION outbox.lock_cursor(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION outbox.advance_cursor(text, bigint) FROM PUBLIC;
REVOKE ALL ON FUNCTION outbox.events_after(bigint, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION outbox.record_dead_letter(text, bigint, integer, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION outbox.prune_delivered(integer) FROM PUBLIC;

GRANT USAGE ON SCHEMA outbox TO outbox_app;
GRANT EXECUTE ON FUNCTION outbox.lock_cursor(text) TO outbox_app;
GRANT EXECUTE ON FUNCTION outbox.advance_cursor(text, bigint) TO outbox_app;
GRANT EXECUTE ON FUNCTION outbox.events_after(bigint, text, integer) TO outbox_app;
GRANT EXECUTE ON FUNCTION outbox.record_dead_letter(text, bigint, integer, text) TO outbox_app;
GRANT EXECUTE ON FUNCTION outbox.prune_delivered(integer) TO outbox_app;

DO $$
DECLARE
  m text;
  modules text[] := ARRAY[
    'identity', 'family', 'access', 'calendar', 'lists', 'notes',
    'files', 'food', 'relations', 'notifications', 'export'
  ];
BEGIN
  FOREACH m IN ARRAY modules LOOP
    EXECUTE format('GRANT USAGE ON SCHEMA outbox TO %I', m || '_app');
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION outbox.append_event(uuid, text, integer, bigint, text, timestamptz, uuid, uuid, jsonb) TO %I',
      m || '_app'
    );
  END LOOP;
END $$;
