// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { DIGITS_PATTERN } from "../../constants.js";

export const contentLengthSchema = z
  .string()
  .regex(DIGITS_PATTERN)
  .transform(Number)
  .pipe(z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER));
