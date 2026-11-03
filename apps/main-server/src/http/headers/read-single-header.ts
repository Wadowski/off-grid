// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { IncomingHttpHeaders } from "node:http";
import { invalidHeader } from "./invalid-header.js";

export const readSingleHeader = (
  headers: IncomingHttpHeaders,
  headerName: string,
): string | undefined => {
  const value = headers[headerName];
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw invalidHeader(headerName);
  }
  return value;
};
