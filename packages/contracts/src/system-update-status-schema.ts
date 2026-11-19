// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import {
  RELEASE_VERSION_PATTERN,
  SERVER_IMAGE_REFERENCE_PATTERN,
  UPDATE_OUTCOMES,
  UPDATE_STEP_NAMES,
  UPDATE_STEP_STATES,
  WEB_IMAGE_REFERENCE_PATTERN,
} from "./constants.js";

const imageReferencesSchema = z.strictObject({
  server: z.string().regex(SERVER_IMAGE_REFERENCE_PATTERN),
  web: z.string().regex(WEB_IMAGE_REFERENCE_PATTERN),
});

const updateStepSchema = z.strictObject({
  name: z.enum(UPDATE_STEP_NAMES),
  state: z.enum(UPDATE_STEP_STATES),
  startedAt: z.iso.datetime().nullable(),
  finishedAt: z.iso.datetime().nullable(),
});

export const updateStatusSchema = z.strictObject({
  runId: z.uuid(),
  currentVersion: z.string().regex(RELEASE_VERSION_PATTERN),
  targetVersion: z.string().regex(RELEASE_VERSION_PATTERN),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime().nullable(),
  outcome: z.enum(UPDATE_OUTCOMES),
  failedStep: z.enum(UPDATE_STEP_NAMES).nullable(),
  steps: z.array(updateStepSchema),
  backupName: z.string().min(1).nullable(),
  previousImages: imageReferencesSchema.nullable(),
  writesAfterBackupLost: z.boolean(),
  message: z.string().min(1),
});
