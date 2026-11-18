// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DatabaseTarget } from "../types.js";

export const passwordEnvironment = (target: DatabaseTarget): NodeJS.ProcessEnv => ({
  ...process.env,
  PGPASSWORD: target.password,
});
