-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE family.user_profile (
  user_id        uuid        PRIMARY KEY,
  display_name   text        NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  source_version integer     NOT NULL CHECK (source_version >= 1),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('family', 'user_profile', 'user');

-- True when the request's user shares a family with the given user. It runs as the owner so
-- the membership lookup is not limited by the caller's own membership rows, and it returns
-- only a boolean, never the rows themselves.
CREATE FUNCTION family.shares_family_with(other_user uuid) RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, family
AS $fn$
  SELECT EXISTS (
    SELECT 1
      FROM family.family_member mine
      JOIN family.family_member theirs ON theirs.family_id = mine.family_id
     WHERE mine.user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
       AND theirs.user_id = other_user
  );
$fn$;

REVOKE ALL ON FUNCTION family.shares_family_with(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION family.shares_family_with(uuid) TO offgrid_app;

-- People see the names of everyone who shares a family with them.
CREATE POLICY user_profile_co_member_read ON family.user_profile
  FOR SELECT
  USING (family.shares_family_with(user_id));
