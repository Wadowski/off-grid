// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { stripLeadingSpace } from "./strip-leading-space.js";
import type { SseFrame } from "./types.js";

export const applySseLine = (frame: SseFrame, line: string): SseFrame => {
  if (line.startsWith(":")) {
    return { ...frame, comments: [...frame.comments, stripLeadingSpace(line.slice(1))] };
  }
  const colon = line.indexOf(":");
  const field = colon === -1 ? line : line.slice(0, colon);
  const value = colon === -1 ? "" : stripLeadingSpace(line.slice(colon + 1));
  switch (field) {
    case "event":
      return { ...frame, event: value };
    case "id":
      return { ...frame, id: value };
    case "data":
      return { ...frame, data: frame.data === undefined ? value : `${frame.data}\n${value}` };
    default:
      return frame;
  }
};
