-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

ALTER TABLE calendar.calendar DROP CONSTRAINT calendar_default_is_personal;

ALTER TABLE calendar.calendar
  ADD CONSTRAINT calendar_default_has_owner CHECK (NOT is_default OR user_id IS NOT NULL OR family_id IS NOT NULL);

CREATE UNIQUE INDEX calendar_one_default_per_family ON calendar.calendar (family_id) WHERE is_default AND family_id IS NOT NULL;

INSERT INTO calendar.calendar (calendar_id, family_id, name, color, is_default)
SELECT gen_random_uuid(), f.family_id, 'Family', 'blue', true
FROM (SELECT DISTINCT family_id FROM calendar.family_membership WHERE is_member) f
ON CONFLICT DO NOTHING;
