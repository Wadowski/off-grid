// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { applySseLine } from "./apply-sse-line.js";
import { EMPTY_SSE_FRAME, LINE_BREAK_PATTERN } from "./constants.js";
import { isEmptySseFrame } from "./is-empty-sse-frame.js";
import type { SseFrame } from "./types.js";

export const parseFrameBlock = (block: string): SseFrame | undefined => {
  const frame = block.split(LINE_BREAK_PATTERN).reduce<SseFrame>(applySseLine, EMPTY_SSE_FRAME);
  return isEmptySseFrame(frame) ? undefined : frame;
};
