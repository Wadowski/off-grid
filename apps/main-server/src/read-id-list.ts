// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { IncomingHttpHeaders } from "node:http";
import { z } from "zod";
import { accessGroupIdSchema } from "@offgrid/contracts";
import { readSingleHeader } from "./read-single-header.js";
import { parseOrReject } from "./parse-or-reject.js";

export const readIdList = (
  headers: IncomingHttpHeaders,
  headerName: string,
): z.output<typeof accessGroupIdSchema>[] => {
  const raw = readSingleHeader(headers, headerName);
  if (raw === undefined) {
    return [];
  }
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => parseOrReject(accessGroupIdSchema, part, headerName));
};
