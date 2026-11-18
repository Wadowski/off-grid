// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { RELEASE_VERSION_PATTERN, releaseManifestSchema } from "@offgrid/contracts";
import type { ApplyRequest, ParsedApplyRequest } from "../types.js";
import { UpdateRefusedError } from "./errors/update-refused-error.js";

const applyRequestSchema = z.object({
  currentVersion: z.string().regex(RELEASE_VERSION_PATTERN),
  manifest: releaseManifestSchema,
});

export const parseApplyRequest = (request: ApplyRequest): ParsedApplyRequest => {
  const parsed = applyRequestSchema.safeParse(request);
  if (!parsed.success) {
    throw new UpdateRefusedError("invalid update request");
  }
  return parsed.data;
};
