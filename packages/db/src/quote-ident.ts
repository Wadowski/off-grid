// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { IDENTIFIER } from "./constants.js";

export const quoteIdent = (name: string): string => {
  if (!IDENTIFIER.test(name)) {
    throw new Error(`invalid SQL identifier: ${JSON.stringify(name)}`);
  }
  return `"${name}"`;
};
