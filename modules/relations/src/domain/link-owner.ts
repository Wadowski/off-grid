// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ActingContext, LinkOwner } from "../types.js";

export const ownerOf = (acting: ActingContext): LinkOwner =>
  acting.familyId === null
    ? { familyId: null, userId: acting.userId }
    : { familyId: acting.familyId, userId: null };
