-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2


CREATE TABLE family.family (
  family_id  uuid        PRIMARY KEY,
  name       text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  created_at timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('family', 'family', 'family');

CREATE TABLE family.family_member (
  family_id uuid        NOT NULL REFERENCES family.family (family_id),
  user_id   uuid        NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (family_id, user_id)
);
SELECT public.offgrid_declare_scope('family', 'family_member', 'family');

CREATE POLICY family_member_own_rows ON family.family_member
  FOR SELECT
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE POLICY family_of_member ON family.family
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family.family_member
       WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
    )
  );
