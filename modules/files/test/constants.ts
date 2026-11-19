// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const RESET_SQL = `TRUNCATE files.file_version, files.file, files.drive, files.family_membership RESTART IDENTITY CASCADE`;
