// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { uuidSchema } from "@offgrid/contracts";
import type { LastEventId, LastEventIdHeader } from "../../types.js";

export const readLastEventId = (header: LastEventIdHeader): LastEventId => {
  if (header === undefined) {
    return { kind: "absent" };
  }
  const parsed = uuidSchema.safeParse(header);
  return parsed.success ? { kind: "valid", id: parsed.data } : { kind: "invalid" };
};
