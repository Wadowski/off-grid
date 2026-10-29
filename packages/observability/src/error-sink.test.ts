// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createMemoryErrorSink } from "./error-sink.js";
import { runWithTrace } from "./trace.js";

describe("createMemoryErrorSink", () => {
  it("stores the error name, message, trace id and redacted context", () => {
    const sink = createMemoryErrorSink({ now: () => new Date("2026-10-29T12:00:00.000Z") });
    runWithTrace("trace-err", () => {
      sink.record(new TypeError("bad input"), { module: "family", password: "p" });
    });
    expect(sink.list()).toEqual([
      {
        recordedAt: "2026-10-29T12:00:00.000Z",
        name: "TypeError",
        message: "bad input",
        trace_id: "trace-err",
        context: { module: "family", password: "[REDACTED]" },
      },
    ]);
  });

  it("records non-Error values as NonError", () => {
    const sink = createMemoryErrorSink();
    sink.record("plain string");
    expect(sink.list()[0]).toMatchObject({
      name: "NonError",
      message: "plain string",
      context: {},
    });
  });

  it("keeps only the most recent errors up to its capacity, oldest first", () => {
    const sink = createMemoryErrorSink({ capacity: 2 });
    sink.record(new Error("one"));
    sink.record(new Error("two"));
    sink.record(new Error("three"));
    expect(sink.list().map((record) => record.message)).toEqual(["two", "three"]);
  });

  it("returns a copy so callers cannot change the stored log", () => {
    const sink = createMemoryErrorSink();
    sink.record(new Error("kept"));
    sink.list().length = 0;
    expect(sink.list()).toHaveLength(1);
  });
});
