-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE family.active_family (
  session_id  uuid        PRIMARY KEY,
  user_id     uuid        NOT NULL,
  family_id   uuid        NOT NULL,
  selected_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (family_id, user_id) REFERENCES family.family_member (family_id, user_id) ON DELETE CASCADE
);
SELECT public.offgrid_declare_scope('family', 'active_family', 'user');

CREATE POLICY active_family_own_rows ON family.active_family
  FOR ALL
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);
