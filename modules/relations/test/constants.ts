// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `TRUNCATE relations.cross_entity_link, relations.linkable_entity_guest, relations.linkable_entity, relations.family_member RESTART IDENTITY CASCADE`;
