// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { PERSONAL_FRAGMENT_MIN_LENGTH } from "../../constants.js";

export const personalPasswordFragments = (email: string, displayName: string): string[] => {
  const localPart = email.split("@")[0] ?? "";
  return [localPart, displayName]
    .map((fragment) => fragment.toLowerCase())
    .filter((fragment) => fragment.length >= PERSONAL_FRAGMENT_MIN_LENGTH);
};
