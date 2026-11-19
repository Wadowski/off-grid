// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildrenCursor } from "../../types.js";
import { cursorPayloadSchema } from "./cursor-payload-schema.js";
import { parseJsonOrNull } from "./parse-json-or-null.js";

export const decodeCursor = (encoded: string): ChildrenCursor | null => {
  const payload = parseJsonOrNull(Buffer.from(encoded, "base64url").toString("utf8"));
  const parsed = cursorPayloadSchema.safeParse(payload);
  return parsed.success ? parsed.data : null;
};
