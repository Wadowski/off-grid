-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- The version of each person's membership in a family, numbered in the order the
-- family changes it. Rows are never deleted, so a person who leaves and rejoins
-- keeps counting up. Events about membership carry this number as their source version.
CREATE TABLE family.membership_version (
  family_id      uuid    NOT NULL,
  user_id        uuid    NOT NULL,
  source_version integer NOT NULL CHECK (source_version >= 1),
  PRIMARY KEY (family_id, user_id)
);
SELECT public.offgrid_declare_scope('family', 'membership_version', 'family');
