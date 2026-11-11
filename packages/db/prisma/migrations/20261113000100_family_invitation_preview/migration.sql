-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- Lets a person who holds a live invitation code see the family it is for and
-- the name of the person who invited them, before they join. Both policies are
-- keyed on app.invitation_code_hash, as the redeem policies are (ADR 0021 and
-- ADR 0027). A row is visible only while its invitation is unused, unrevoked
-- and unexpired, and nothing else about the family or its members is exposed.

-- The policy is row-level, so it exposes every column of family.family to a
-- code holder. The preview reads only the name and creation time. A column
-- added to family.family later must be reviewed against this policy first.
CREATE POLICY family_visible_to_invitation_code ON family.family
  FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM family.invitation
       WHERE code_hash = current_setting('app.invitation_code_hash', true)
         AND used_at IS NULL
         AND revoked_at IS NULL
         AND expires_at > now()
    )
  );

CREATE POLICY account_name_of_invitation_inviter ON family.account_name
  FOR SELECT
  USING (
    user_id IN (
      SELECT created_by FROM family.invitation
       WHERE code_hash = current_setting('app.invitation_code_hash', true)
         AND used_at IS NULL
         AND revoked_at IS NULL
         AND expires_at > now()
    )
  );
