-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE family.family DROP CONSTRAINT family_accent_check;

UPDATE family.family SET accent = CASE accent
  WHEN 'sage' THEN 'green'
  WHEN 'terracotta' THEN 'orange'
  WHEN 'lilac' THEN 'purple'
  ELSE accent
END;

ALTER TABLE family.family
  ADD CONSTRAINT family_accent_check CHECK (accent IN (
    'blue', 'sky', 'teal', 'green', 'lime', 'amber',
    'orange', 'red', 'pink', 'purple', 'indigo', 'slate'
  ));
