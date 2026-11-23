// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";

export const FILE_NAME_MAX_LENGTH = 255;

export const fileNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(FILE_NAME_MAX_LENGTH)
  .refine(
    (name) =>
      !name.includes("/") &&
      !name.includes("\\") &&
      !name.includes("\u0000") &&
      name !== "." &&
      name !== "..",
    "The name must not contain a slash, a backslash or a NUL character, and must not be . or ..",
  );
