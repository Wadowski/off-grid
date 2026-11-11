-- SPDX-FileCopyrightText: 2026 Dominik Wadowski
-- SPDX-License-Identifier: FSL-1.1-ALv2

-- A read-only copy of who belongs to each family, fed by family membership events.
-- The calendar module uses it to decide which family calendars a person can manage.
-- A removed membership stays as a row with is_member = false, so a late event
-- cannot bring it back: source_version keeps the newest change that was applied.
CREATE TABLE calendar.family_membership (
  family_id      uuid    NOT NULL,
  user_id        uuid    NOT NULL,
  source_version integer NOT NULL CHECK (source_version >= 1),
  is_member      boolean NOT NULL,
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
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member));

CREATE POLICY calendar_event_family_member_access ON calendar.calendar_event
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member));

CREATE POLICY event_guest_family_member_access ON calendar.event_guest
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member));

CREATE POLICY event_reminder_family_member_access ON calendar.event_reminder
  FOR ALL
  USING (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member))
  WITH CHECK (family_id IN (SELECT family_id FROM calendar.family_membership WHERE user_id = NULLIF(current_setting('app.user_id', true), '')::uuid AND is_member));
