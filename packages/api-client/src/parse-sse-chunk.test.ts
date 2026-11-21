// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { parseSseChunk } from "./parse-sse-chunk.js";
import type { SseFrame } from "./types.js";

const NOTICE_ID = "018f3c2e-7b1a-7c3d-9e4f-0a1b2c3d4e5f";
const NOTICE_FRAME = `event: notification\nid: ${NOTICE_ID}\ndata: {"type":"event-reminder"}\n\n`;

const parseChunks = (chunks: readonly string[]): readonly SseFrame[] => {
  const result = chunks.reduce(
    (state, chunk) => {
      const parsed = parseSseChunk(state.pending, chunk);
      return { pending: parsed.pending, frames: [...state.frames, ...parsed.frames] };
    },
    { pending: "", frames: [] as readonly SseFrame[] },
  );
  return result.frames;
};

const frameWith = (overrides: Partial<SseFrame>): SseFrame => ({
  event: undefined,
  id: undefined,
  data: undefined,
  comments: [],
  ...overrides,
});

describe("parseSseChunk", () => {
  it("parses a notification frame with event, id and data", () => {
    expect(parseChunks([NOTICE_FRAME])).toEqual([
      frameWith({
        event: "notification",
        id: NOTICE_ID,
        data: '{"type":"event-reminder"}',
      }),
    ]);
  });

  it("parses a comment-only frame", () => {
    expect(parseChunks([": heartbeat\n\n"])).toEqual([frameWith({ comments: ["heartbeat"] })]);
  });

  it("accepts LF, CRLF and CR line endings", () => {
    const expected = [frameWith({ event: "notification", id: NOTICE_ID, data: "x" })];
    expect(parseChunks([`event: notification\nid: ${NOTICE_ID}\ndata: x\n\n`])).toEqual(expected);
    expect(parseChunks([`event: notification\r\nid: ${NOTICE_ID}\r\ndata: x\r\n\r\n`])).toEqual(
      expected,
    );
    expect(parseChunks([`event: notification\rid: ${NOTICE_ID}\rdata: x\r\r\r`])).toEqual(expected);
  });

  it("gives the same frames whichever byte the input is split at", () => {
    const input = `: reset\n\n${NOTICE_FRAME}: heartbeat\r\n\r\n`;
    const unsplit = parseChunks([input]);
    for (let split = 0; split <= input.length; split += 1) {
      expect(parseChunks([input.slice(0, split), input.slice(split)])).toEqual(unsplit);
    }
  });

  it("joins multiple data lines with a newline", () => {
    expect(parseChunks(["data: first\ndata: second\n\n"])).toEqual([
      frameWith({ data: "first\nsecond" }),
    ]);
  });

  it("strips only one leading space after the colon", () => {
    expect(parseChunks(["data:no-space\n\n"])).toEqual([frameWith({ data: "no-space" })]);
    expect(parseChunks(["data:  two\n\n"])).toEqual([frameWith({ data: " two" })]);
  });

  it("returns a frame without an id when none is sent", () => {
    expect(parseChunks(["event: notification\ndata: x\n\n"])).toEqual([
      frameWith({ event: "notification", data: "x" }),
    ]);
  });

  it("ignores unknown fields", () => {
    expect(parseChunks(["retry: 5000\ndata: x\n\n"])).toEqual([frameWith({ data: "x" })]);
  });

  it("parses two frames that arrive in one chunk", () => {
    expect(parseChunks([`${NOTICE_FRAME}: heartbeat\n\n`])).toEqual([
      frameWith({ event: "notification", id: NOTICE_ID, data: '{"type":"event-reminder"}' }),
      frameWith({ comments: ["heartbeat"] }),
    ]);
  });

  it("keeps an unfinished frame as pending text", () => {
    const parsed = parseSseChunk("", "event: notification\ndata: partial");
    expect(parsed.frames).toEqual([]);
    expect(parsed.pending).toBe("event: notification\ndata: partial");
  });

  it("keeps a trailing carriage return pending until the next chunk decides the line end", () => {
    const first = parseSseChunk("", "data: x\r");
    expect(first.frames).toEqual([]);
    const second = parseSseChunk(first.pending, "\n\r\n");
    expect(second.frames).toEqual([frameWith({ data: "x" })]);
    expect(second.pending).toBe("");
  });
});
