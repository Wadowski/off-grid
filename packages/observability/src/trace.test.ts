// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { currentTraceId } from "./current-trace-id.js";
import { resolveTraceId } from "./resolve-trace-id.js";
import { runWithTrace } from "./run-with-trace.js";

describe("resolveTraceId", () => {
  it("generates a new id each time when none is given", () => {
    const first = resolveTraceId(undefined);
    expect(first).toMatch(/^[A-Za-z0-9._-]{1,128}$/);
    expect(resolveTraceId(undefined)).not.toBe(first);
  });

  it("keeps a well-formed incoming id", () => {
    expect(resolveTraceId("abc-123")).toBe("abc-123");
  });

  it("replaces malformed incoming ids, including ones that could inject into log lines", () => {
    expect(resolveTraceId("has spaces")).not.toBe("has spaces");
    expect(resolveTraceId("a\nb")).not.toContain("\n");
    expect(resolveTraceId("")).not.toBe("");
    expect(resolveTraceId("x".repeat(129))).toMatch(/^[A-Za-z0-9._-]{1,128}$/);
    expect(resolveTraceId("has spaces")).toMatch(/^[A-Za-z0-9._-]{1,128}$/);
    expect(resolveTraceId("v1.trace_id-2")).toBe("v1.trace_id-2");
  });
});

describe("runWithTrace", () => {
  it("rejects ids that could inject into log lines", () => {
    expect(() => runWithTrace('bad"id', () => undefined)).toThrow(TypeError);
  });

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
