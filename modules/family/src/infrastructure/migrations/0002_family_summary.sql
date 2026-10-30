-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE family.family_summary (
  user_id        uuid   NOT NULL,
  family_id      uuid   NOT NULL,
  name           text   NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  source_version bigint NOT NULL CHECK (source_version >= 1),
  PRIMARY KEY (user_id, family_id)
);
SELECT public.offgrid_declare_scope('family', 'family_summary', 'user');
