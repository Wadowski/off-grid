// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  currentTraceId,
  isValidTraceId,
  newTraceId,
  resolveTraceId,
  runWithTrace,
} from "./trace.js";

describe("trace ids", () => {
  it("generates a valid id each time", () => {
    const first = newTraceId();
    expect(isValidTraceId(first)).toBe(true);
    expect(newTraceId()).not.toBe(first);
  });

  it("keeps a well-formed incoming id and replaces a malformed one", () => {
    expect(resolveTraceId("abc-123")).toBe("abc-123");
    expect(resolveTraceId("has spaces")).not.toBe("has spaces");
    expect(resolveTraceId("x".repeat(65))).not.toBe("x".repeat(65));
    expect(resolveTraceId(undefined)).toBeTypeOf("string");
  });

  it("rejects ids that could inject into log lines", () => {
    expect(isValidTraceId("a\nb")).toBe(false);
    expect(isValidTraceId("")).toBe(false);
    expect(() => runWithTrace('bad"id', () => undefined)).toThrow(TypeError);
  });
});

describe("runWithTrace", () => {
  it("exposes the trace id inside the callback and nothing outside", () => {
    expect(currentTraceId()).toBeUndefined();
    runWithTrace("trace-1", () => {
      expect(currentTraceId()).toBe("trace-1");
    });
    expect(currentTraceId()).toBeUndefined();
  });

  it("keeps the trace id across awaited work", async () => {
    await runWithTrace("trace-async", async () => {
      await Promise.resolve();
      await new Promise<void>((resolve) => setImmediate(resolve));
      expect(currentTraceId()).toBe("trace-async");
    });
  });

  it("nests and restores the outer trace", () => {
    runWithTrace("outer", () => {
      runWithTrace("inner", () => {
        expect(currentTraceId()).toBe("inner");
      });
      expect(currentTraceId()).toBe("outer");
    });
  });
});
