// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter,
  notifications.notification
  RESTART IDENTITY CASCADE`;
