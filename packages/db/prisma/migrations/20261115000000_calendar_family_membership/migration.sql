-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- A read-only copy of who belongs to each family, fed by family events.
-- The calendar module uses it to decide which family calendars a person can manage.
CREATE TABLE calendar.family_membership (
  family_id uuid NOT NULL,
  user_id   uuid NOT NULL,
  PRIMARY KEY (family_id, user_id)
);
SELECT public.offgrid_declare_scope('calendar', 'family_membership', 'family');

-- A person can always read their own memberships, so the policies below can
-- check membership without the family context that the caller does not have.
CREATE POLICY family_membership_own_rows ON calendar.family_membership
  FOR SELECT
  USING (user_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

-- Any member of a family may read, add, change and remove its family-owned rows.
CREATE POLICY calendar_family_member_access ON calendar.calendar
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid));

CREATE POLICY calendar_event_family_member_access ON calendar.calendar_event
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid));

CREATE POLICY event_guest_family_member_access ON calendar.event_guest
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid));

CREATE POLICY event_reminder_family_member_access ON calendar.event_reminder
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid));
