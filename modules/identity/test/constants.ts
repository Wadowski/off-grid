// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter,
  identity.notification, identity.recovery_code, identity.password_reset, identity.session, identity.credential, identity.first_admin_claim,
  identity.user_account
  RESTART IDENTITY CASCADE;
  UPDATE identity.instance_settings SET registration_open = true`;
