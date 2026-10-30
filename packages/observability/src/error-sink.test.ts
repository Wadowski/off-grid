// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createMemoryErrorSink } from "./create-memory-error-sink.js";
import { runWithTrace } from "./run-with-trace.js";

describe("createMemoryErrorSink", () => {
  it("stores the error name, trace id and redacted context, but not the message", () => {
    const sink = createMemoryErrorSink({ now: () => new Date("2026-10-29T12:00:00.000Z") });
    runWithTrace("trace-err", () => {
      sink.record(new TypeError("Key (email)=(ada@example.test) already exists"), {
        module: "family",
        password: "p",
      });
    });
    expect(sink.list()).toEqual([
      {
        recorded_at: "2026-10-29T12:00:00.000Z",
        name: "TypeError",
        trace_id: "trace-err",
        context: { module: "family", password: "[REDACTED]" },
      },
    ]);
  });

  it("keeps a string error code and drops every other property", () => {
    const sink = createMemoryErrorSink();
    sink.record(
      Object.assign(new Error("duplicate key"), { code: "23505", detail: "ada@example.test" }),
    );
    expect(sink.list()[0]).toMatchObject({ name: "Error", code: "23505" });
    expect(JSON.stringify(sink.list())).not.toContain("ada@example.test");
  });

  it("records non-Error values as NonError without their text", () => {
    const sink = createMemoryErrorSink();
    sink.record("ada@example.test");
    expect(sink.list()[0]).toMatchObject({ name: "NonError", context: {} });
    expect(JSON.stringify(sink.list())).not.toContain("ada@example.test");
  });

  it("omits trace_id when recorded outside a trace context", () => {
    const sink = createMemoryErrorSink();
    sink.record(new Error("no trace"));
    expect(sink.list()[0]).not.toHaveProperty("trace_id");
  });

  it("keeps only the most recent errors up to its capacity, oldest first", () => {
    const sink = createMemoryErrorSink({ capacity: 2 });
    sink.record(new Error("one"));
    sink.record(new Error("two"));
    sink.record(new Error("three"));
    expect(sink.list().map((record) => record.name)).toEqual(["Error", "Error"]);
    expect(sink.list()).toHaveLength(2);
  });

  it("returns a copy so callers cannot change the stored log", () => {
    const sink = createMemoryErrorSink();
    sink.record(new Error("kept"));
    sink.list().length = 0;
    expect(sink.list()).toHaveLength(1);
  });
});
