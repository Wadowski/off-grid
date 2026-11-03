// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import { invalidHeader } from "./invalid-header.js";

export const parseOrReject = <Schema extends z.ZodType<string>>(
  schema: Schema,
  value: string,
  headerName: string,
): z.output<Schema> => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw invalidHeader(headerName);
  }
  return parsed.data;
};
