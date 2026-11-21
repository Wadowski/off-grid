// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { LineEnd } from "./types.js";

export const carriageReturnEnd = (text: string, index: number): LineEnd | undefined => {
  if (index + 1 === text.length) {
    return undefined;
  }
  const followsLineFeed = text.charAt(index + 1) === "\n";
  return { end: index, next: index + (followsLineFeed ? 2 : 1) };
};
