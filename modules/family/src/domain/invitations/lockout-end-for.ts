// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AttemptPolicy } from "../../types.js";

export const lockoutEndFor = (failures: number, policy: AttemptPolicy, now: Date): Date | null =>
  failures >= policy.limit ? new Date(now.getTime() + policy.lockoutMs) : null;
