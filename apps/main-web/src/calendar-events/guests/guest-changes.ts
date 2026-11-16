// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { GuestChanges } from "../types.js";

export const guestChanges = (
  initialIds: readonly string[],
  currentIds: readonly string[],
): GuestChanges => ({
  toInvite: currentIds.filter((userId) => !initialIds.includes(userId)),
  toRemove: initialIds.filter((userId) => !currentIds.includes(userId)),
});
