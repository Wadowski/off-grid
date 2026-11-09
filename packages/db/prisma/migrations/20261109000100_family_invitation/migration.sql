-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE family.invitation (
  invitation_id uuid        PRIMARY KEY,
  family_id     uuid        NOT NULL REFERENCES family.family (family_id),
  code_hash     text        NOT NULL UNIQUE CHECK (char_length(code_hash) = 64),
  created_by    uuid        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  used_by       uuid,
  used_at       timestamptz,
  revoked_at    timestamptz,
  CHECK (used_at IS NULL OR used_by IS NOT NULL)
);
SELECT public.offgrid_declare_scope('family', 'invitation', 'family');

DROP POLICY invitation_scope ON family.invitation;

CREATE POLICY invitation_admin_manage ON family.invitation
  FOR ALL
  USING (
    family_id IN (
      SELECT family_id FROM family.family_member
       WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
         AND role = 'admin'
    )
  )
  WITH CHECK (
    family_id IN (
      SELECT family_id FROM family.family_member
       WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid
         AND role = 'admin'
    )
  );

CREATE POLICY invitation_redeem_read ON family.invitation
  FOR SELECT
  USING (
    code_hash = current_setting('app.invitation_code_hash', true)
    AND expires_at > now()
  );

CREATE POLICY invitation_redeem_update ON family.invitation
  FOR UPDATE
  USING (
    code_hash = current_setting('app.invitation_code_hash', true)
    AND used_at IS NULL
    AND revoked_at IS NULL
    AND expires_at > now()
  )
  WITH CHECK (used_by = NULLIF(current_setting('app.user_id', true), '')::uuid);

CREATE TABLE family.invitation_attempt (
  user_id      uuid        PRIMARY KEY,
  failures     integer     NOT NULL DEFAULT 0 CHECK (failures >= 0),
  locked_until timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now()
);
SELECT public.offgrid_declare_scope('family', 'invitation_attempt', 'user');
