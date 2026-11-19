// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { EventWithoutFamilyError } from "../../application/errors/event-without-family-error.js";

export const requireEventFamilyId = (familyId: string | null): string => {
  if (familyId === null) {
    throw new EventWithoutFamilyError();
  }
  return familyId;
};
