-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

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
