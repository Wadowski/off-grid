// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LinkOwner } from "../types.js";
import { EventWithoutOwnerError } from "../application/errors/event-without-owner-error.js";

export const requireOwner = (owner: {
  readonly familyId: string | null;
  readonly userId: string | null;
}): LinkOwner => {
  if (owner.familyId === null && owner.userId === null) {
    throw new EventWithoutOwnerError();
  }
  return owner;
};
