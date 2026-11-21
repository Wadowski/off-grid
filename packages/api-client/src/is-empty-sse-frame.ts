// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SseFrame } from "./types.js";

export const isEmptySseFrame = (frame: SseFrame): boolean =>
  frame.event === undefined &&
  frame.id === undefined &&
  frame.data === undefined &&
  frame.comments.length === 0;
