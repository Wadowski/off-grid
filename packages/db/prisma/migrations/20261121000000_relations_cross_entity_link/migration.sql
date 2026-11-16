-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE relations.linkable_entity (
  entity_type    text    NOT NULL CHECK (entity_type IN ('calendar-event')),
  entity_id      uuid    NOT NULL,
  family_id      uuid,
  user_id        uuid,
  title          text    NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  source_version integer NOT NULL CHECK (source_version >= 1),
  is_removed     boolean NOT NULL DEFAULT false,
  PRIMARY KEY (entity_type, entity_id)
);
SELECT public.offgrid_declare_scope('relations', 'linkable_entity', 'family-or-user');

CREATE TABLE relations.linkable_entity_guest (
  entity_type  text        NOT NULL CHECK (entity_type IN ('calendar-event')),
  entity_id    uuid        NOT NULL,
  user_id      uuid        NOT NULL,
  host_user_id uuid        NOT NULL,
  invited_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, user_id)
);
SELECT public.offgrid_declare_scope('relations', 'linkable_entity_guest', 'user');

CREATE TABLE relations.family_member (
  family_id      uuid    NOT NULL,
  user_id        uuid    NOT NULL,
  source_version integer NOT NULL CHECK (source_version >= 1),
  is_member      boolean NOT NULL,
  PRIMARY KEY (family_id, user_id)
);
SELECT public.offgrid_declare_scope('relations', 'family_member', 'family');

CREATE TABLE relations.cross_entity_link (
  link_id     uuid        PRIMARY KEY,
  source_type text        NOT NULL CHECK (source_type IN ('calendar-event')),
  source_id   uuid        NOT NULL,
  target_type text        NOT NULL CHECK (target_type IN ('calendar-event')),
  target_id   uuid        NOT NULL,
  family_id   uuid,
  user_id     uuid,
  created_by  uuid        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT (source_type = target_type AND source_id = target_id)),
  UNIQUE (source_type, source_id, target_type, target_id)
);
CREATE INDEX cross_entity_link_source_idx ON relations.cross_entity_link (source_type, source_id);
CREATE INDEX cross_entity_link_target_idx ON relations.cross_entity_link (target_type, target_id);
SELECT public.offgrid_declare_scope('relations', 'cross_entity_link', 'family-or-user');

-- Relations reads family membership of the host of a guest invitation. Row-level policies
-- hide other people's membership rows, so this function reads relations.family_member
-- without them and returns only whether the caller shares a current family with the user.
CREATE FUNCTION relations.shares_family_with_caller(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = relations, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM relations.family_member caller_row
    JOIN relations.family_member other_row ON other_row.family_id = caller_row.family_id
    WHERE caller_row.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      AND caller_row.is_member
      AND other_row.user_id = p_user_id
      AND other_row.is_member
  );
$$;

REVOKE ALL ON FUNCTION relations.shares_family_with_caller(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION relations.shares_family_with_caller(uuid) TO offgrid_app;

CREATE POLICY family_member_own_rows ON relations.family_member
  FOR SELECT
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- A guest reads a linkable event only while the guest still shares a family with the host
-- who invited them (ADR 0029, applied to links).
CREATE POLICY linkable_entity_guest_read ON relations.linkable_entity
  FOR SELECT
  USING ((entity_type, entity_id) IN (
    SELECT entity_type, entity_id FROM relations.linkable_entity_guest
    WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
      AND relations.shares_family_with_caller(host_user_id)
  ));

-- The host of an event manages the guest rows of that event. The projection handler sets the
-- host as the user context when it applies an invitation or a removal.
CREATE POLICY linkable_entity_guest_host_access ON relations.linkable_entity_guest
  FOR ALL
  USING (host_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (host_user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);
