// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { z } from "zod";
import type { IncomingHttpHeaders } from "node:http";
import { readSingleHeader } from "./read-single-header.js";
import { parseOrReject } from "./parse-or-reject.js";

export const readId = <Schema extends z.ZodType<string>>(
  headers: IncomingHttpHeaders,
  headerName: string,
  schema: Schema,
): z.output<Schema> | null => {
  const raw = readSingleHeader(headers, headerName);
  if (raw === undefined) {
    return null;
  }
  return parseOrReject(schema, raw, headerName);
};
