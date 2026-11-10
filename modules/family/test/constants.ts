// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter,
  family.user_profile, family.invitation_attempt, family.invitation, family.family_member, family.family RESTART IDENTITY CASCADE`;
