// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { FileListOptions } from "./types.js";

export const withListQuery = (path: string, options: FileListOptions): string => {
  const params = new URLSearchParams();
  if (options.cursor !== undefined) {
    params.set("cursor", options.cursor);
  }
  if (options.limit !== undefined) {
    params.set("limit", String(options.limit));
  }
  if (options.sort !== undefined) {
    params.set("sort", options.sort);
  }
  if (options.direction !== undefined) {
    params.set("direction", options.direction);
  }
  const query = params.toString();
  return query.length === 0 ? path : `${path}?${query}`;
};
