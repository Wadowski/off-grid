-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

CREATE TABLE family.membership_version (
  family_id      uuid    NOT NULL,
  user_id        uuid    NOT NULL,
  source_version integer NOT NULL CHECK (source_version >= 1),
  PRIMARY KEY (family_id, user_id)
);
SELECT public.offgrid_declare_scope('family', 'membership_version', 'family');

INSERT INTO family.membership_version (family_id, user_id, source_version)
SELECT family_id, user_id, 1
  FROM family.family_member
ON CONFLICT (family_id, user_id) DO NOTHING;

INSERT INTO outbox.subscriber_cursor (subscriber, last_sequence)
SELECT 'calendar-family-membership', COALESCE(max(sequence), 0)
  FROM outbox.event
ON CONFLICT (subscriber) DO NOTHING;
