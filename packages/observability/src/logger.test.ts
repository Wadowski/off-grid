// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createLogger } from "./create-logger.js";
import { runWithTrace } from "./run-with-trace.js";

const fixedNow = () => new Date("2026-10-29T12:00:00.000Z");

const capture = () => {
  const lines: Record<string, unknown>[] = [];
  return {
    lines,
    sink: (line: string) => {
      lines.push(JSON.parse(line) as Record<string, unknown>);
    },
  };
};

describe("createLogger", () => {
  it("writes one JSON object per record with level, time and message", () => {
    const { lines, sink } = capture();
    createLogger({ sink, now: fixedNow }).info("started");
    expect(lines).toEqual([{ level: "info", time: "2026-10-29T12:00:00.000Z", msg: "started" }]);
  });

  it("includes the current trace id, module and family id when known", () => {
    const { lines, sink } = capture();
    const logger = createLogger({ sink, now: fixedNow, module: "family" });
    runWithTrace("trace-7", () => {
      logger.child({ family_id: "fam-1" }).warn("hello", { count: 2 });
    });
    expect(lines[0]).toMatchObject({
      level: "warn",
      module: "family",
      family_id: "fam-1",
      trace_id: "trace-7",
      count: 2,
    });
  });

  it("omits trace_id outside a trace context", () => {
    const { lines, sink } = capture();
    createLogger({ sink, now: fixedNow }).info("no trace");
    expect(lines[0]).not.toHaveProperty("trace_id");
  });

  it("does not let a caller override the trace id", () => {
    const { lines, sink } = capture();
    runWithTrace("real", () => {
      createLogger({ sink, now: fixedNow }).info("spoof", { trace_id: "fake" });
    });
    expect(lines[0]).toMatchObject({ trace_id: "real" });
  });

  it("does not let a caller override level, time or message", () => {
    const { lines, sink } = capture();
    createLogger({ sink, now: fixedNow }).info("real message", {
      level: "debug",
      time: "1999-01-01T00:00:00.000Z",
      msg: "spoof",
    });
    expect(lines[0]).toMatchObject({
      level: "info",
      time: "2026-10-29T12:00:00.000Z",
      msg: "real message",
    });
  });

  it("drops records below the configured level", () => {
    const { lines, sink } = capture();
    const logger = createLogger({ sink, now: fixedNow, level: "warn" });
    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    expect(lines.map((line) => line["level"])).toEqual(["warn", "error"]);
  });

  it("redacts sensitive fields before writing", () => {
    const { lines, sink } = capture();
    createLogger({ sink, now: fixedNow, redact: { extraKeys: ["email"] } }).info("login", {
      password: "hunter2",
      headers: { authorization: "Bearer xyz" },
      email: "ada@example.test",
    });
    expect(lines[0]).toMatchObject({
      password: "[REDACTED]",
      headers: { authorization: "[REDACTED]" },
      email: "[REDACTED]",
    });
    expect(JSON.stringify(lines[0])).not.toContain("hunter2");
  });
});
