// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MIME_FAMILY_KINDS } from "../constants.js";
import type { FileKind } from "./types.js";

export const kindOfMimeFamily = (baseType: string): FileKind | undefined => {
  const family = Object.keys(MIME_FAMILY_KINDS).find((prefix) => baseType.startsWith(prefix));
  return family === undefined ? undefined : MIME_FAMILY_KINDS[family];
};
