-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2
CREATE TABLE family.family_summary (
  family_id      uuid   PRIMARY KEY,
  name           text   NOT NULL,
  source_version bigint NOT NULL CHECK (source_version >= 1)
);
SELECT public.offgrid_declare_scope('family', 'family_summary', 'family');
