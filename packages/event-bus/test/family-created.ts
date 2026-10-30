// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineEvent } from "@offgrid/contracts";
import { z } from "zod";

export const familyCreated = defineEvent({
  name: "family-created-v1",
  version: 1,
  schema: z.object({ name: z.string().min(1).max(100) }),
});
