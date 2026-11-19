-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE files.family_membership (
  family_id      uuid    NOT NULL,
  user_id        uuid    NOT NULL,
  source_version integer NOT NULL CHECK (source_version >= 1),
  is_member      boolean NOT NULL,
  PRIMARY KEY (family_id, user_id)
);
SELECT public.offgrid_declare_scope('files', 'family_membership', 'family');

CREATE POLICY family_membership_own_rows ON files.family_membership
  FOR SELECT
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE FUNCTION files.is_family_member(p_family_id uuid) RETURNS boolean
  LANGUAGE sql STABLE
  AS $fn$
    SELECT EXISTS (
      SELECT 1 FROM files.family_membership
       WHERE family_id = p_family_id
         AND user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
         AND is_member
    );
  $fn$;
REVOKE ALL ON FUNCTION files.is_family_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION files.is_family_member(uuid) TO offgrid_app;

CREATE POLICY drive_family_member_access ON files.drive
  FOR ALL
  USING (family_id IS NOT NULL AND files.is_family_member(family_id))
  WITH CHECK (family_id IS NOT NULL AND files.is_family_member(family_id));

CREATE POLICY file_family_member_access ON files.file
  FOR ALL
  USING (family_id IS NOT NULL AND files.is_family_member(family_id))
  WITH CHECK (family_id IS NOT NULL AND files.is_family_member(family_id));

CREATE POLICY file_version_family_member_access ON files.file_version
  FOR ALL
  USING (family_id IS NOT NULL AND files.is_family_member(family_id))
  WITH CHECK (family_id IS NOT NULL AND files.is_family_member(family_id));
