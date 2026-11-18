// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget } from "../types.js";

export const connectionArguments = (target: DatabaseTarget): string[] => [
  "--host",
  target.host,
  "--port",
  String(target.port),
  "--username",
  target.user,
  "--dbname",
  target.database,
];
