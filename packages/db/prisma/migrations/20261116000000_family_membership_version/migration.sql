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

-- Members who joined before this table existed already have their add event at
-- version 1, so their counter starts at 1 and their next change is version 2.
INSERT INTO family.membership_version (family_id, user_id, source_version)
SELECT family_id, user_id, 1
  FROM family.family_member
ON CONFLICT (family_id, user_id) DO NOTHING;

-- Membership events published before this change have no membership version, and both
-- the join and the leave are version 1. Replaying them would re-admit people who left
-- earlier, so the calendar subscriber starts after the events that exist now. People
-- who were members then do not get calendar access until they rejoin.
INSERT INTO outbox.subscriber_cursor (subscriber, last_sequence)
SELECT 'calendar-family-membership', COALESCE(max(sequence), 0)
  FROM outbox.event
ON CONFLICT (subscriber) DO NOTHING;
