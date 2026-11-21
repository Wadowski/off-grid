// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { STREAM_LINE_LIMIT_MESSAGE, STREAM_PENDING_LIMIT_CHARS } from "./constants.js";
import { parseSseChunk } from "./parse-sse-chunk.js";
import type { SseFrame } from "./types.js";

export const readStreamFrames = async (
  body: ReadableStream<Uint8Array>,
  signal: AbortSignal,
  onFrame: (frame: SseFrame) => void,
): Promise<void> => {
  const reader = body.getReader();
  const cancel = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener("abort", cancel, { once: true });
  if (signal.aborted) {
    cancel();
  }
  const decoder = new TextDecoder();
  let pending = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) {
        return;
      }
      const parsed = parseSseChunk(pending, decoder.decode(value, { stream: true }));
      parsed.frames.forEach(onFrame);
      pending = parsed.pending;
      if (pending.length > STREAM_PENDING_LIMIT_CHARS) {
        throw new Error(STREAM_LINE_LIMIT_MESSAGE);
      }
    }
  } finally {
    signal.removeEventListener("abort", cancel);
    await reader.cancel().catch(() => undefined);
  }
};
