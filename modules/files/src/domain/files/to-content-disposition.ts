// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ContentDisposition } from "../../types.js";
import { encodeRfc5987Value } from "./encode-rfc5987-value.js";
import { toAsciiFileName } from "./to-ascii-file-name.js";
import { toWellFormedName } from "./to-well-formed-name.js";

export const toContentDisposition = (fileName: string, disposition: ContentDisposition): string => {
  const wellFormedName = toWellFormedName(fileName);
  return `${disposition}; filename="${toAsciiFileName(wellFormedName)}"; filename*=UTF-8''${encodeRfc5987Value(wellFormedName)}`;
};
