// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { carriageReturnEnd } from "./carriage-return-end.js";
import type { LineEnd } from "./types.js";

export const findLineEnd = (text: string, from: number): LineEnd | undefined => {
  for (let index = from; index < text.length; index += 1) {
    const character = text.charAt(index);
    if (character === "\n") {
      return { end: index, next: index + 1 };
    }
    if (character === "\r") {
      return carriageReturnEnd(text, index);
    }
  }
  return undefined;
};
