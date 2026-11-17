// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const filesErrorCodeSchema = z.enum([
  "NOT_FOUND",
  "VALIDATION_FAILED",
  "UNAUTHENTICATED",
  "NAME_TAKEN",
  "INVALID_MOVE",
  "NOT_TRASHED",
  "IS_FOLDER",
  "UPLOAD_INCOMPLETE",
  "UPLOAD_OFFSET_MISMATCH",
]);
