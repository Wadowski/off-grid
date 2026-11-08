// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { RecoveryRouteState } from "./types.js";

export const isRecoveryRouteState = (value: unknown): value is RecoveryRouteState =>
  typeof value === "object" &&
  value !== null &&
  "email" in value &&
  typeof value.email === "string" &&
  "method" in value &&
  (value.method === "recoveryCode" || value.method === "emailCode");
