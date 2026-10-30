// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const INIT_SCRIPTS = [
  "../../../infra/init/sql/01-roles-and-schemas.sql",
  "../../../infra/init/sql/02-scope-helpers.sql",
  "../../../infra/init/sql/03-bus-membership.sql",
];

export const RESET_SQL = `TRUNCATE outbox.event, outbox.subscriber_cursor, outbox.dead_letter,
  family.family_member, family.family RESTART IDENTITY CASCADE`;
