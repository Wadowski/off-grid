// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { AccountSnapshot } from "../types.js";

export const isActiveAdmin = (account: Pick<AccountSnapshot, "instanceRole" | "status">): boolean =>
  account.instanceRole === "admin" && account.status === "active";
