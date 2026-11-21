// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { findLineEnd } from "./find-line-end.js";
import { parseFrameBlock } from "./parse-frame-block.js";
import type { SseFrame, SseParseResult } from "./types.js";

export const parseSseChunk = (pending: string, chunk: string): SseParseResult => {
  const text = pending + chunk;
  const frames: SseFrame[] = [];
  let blockStart = 0;
  let lineStart = 0;
  let lineEnd = findLineEnd(text, lineStart);
  while (lineEnd !== undefined) {
    if (lineEnd.end === lineStart) {
      const frame = parseFrameBlock(text.slice(blockStart, lineStart));
      if (frame !== undefined) {
        frames.push(frame);
      }
      blockStart = lineEnd.next;
    }
    lineStart = lineEnd.next;
    lineEnd = findLineEnd(text, lineStart);
  }
  return { frames, pending: text.slice(blockStart) };
};
