// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const errorCodeSchema = z
  .string()
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/);
