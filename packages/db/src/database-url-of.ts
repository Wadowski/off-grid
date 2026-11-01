// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget } from "./types.js";

export const databaseUrlOf = (target: DatabaseTarget): string =>
  `postgresql://${encodeURIComponent(target.user)}:${encodeURIComponent(target.password)}@${target.host}:${target.port}/${encodeURIComponent(target.database)}`;
