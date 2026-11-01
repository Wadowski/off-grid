// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccountSnapshot } from "../types.js";

export const hasActiveAdmin = (accounts: readonly AccountSnapshot[]): boolean =>
  accounts.some((account) => account.instanceRole === "admin" && account.status === "active");
