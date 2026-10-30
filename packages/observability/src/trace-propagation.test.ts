// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createLogger } from "./create-logger.js";
import { currentTraceId } from "./current-trace-id.js";
import { resolveTraceId } from "./resolve-trace-id.js";
import { runWithTrace } from "./run-with-trace.js";

describe("trace propagation", () => {
  it("keeps the trace id on a handler's log line after the handler awaits", async () => {
    const lines: Record<string, unknown>[] = [];
    const logger = createLogger({
      bindings: { module: "family" },
      sink: (line) => {
        lines.push(JSON.parse(line) as Record<string, unknown>);
      },
    });

    let outboxEvent: { type: string; traceId: string | undefined } | undefined;
    let handlerDone: Promise<void> | undefined;

    const handler = (event: { traceId: string | undefined }) =>
      runWithTrace(event.traceId ?? resolveTraceId(undefined), async () => {
        await Promise.resolve();
        logger.info("projection updated");
      });

    const requestTrace = resolveTraceId("req-42");
    runWithTrace(requestTrace, () => {
      logger.info("request started");
      outboxEvent = { type: "family-created-v1", traceId: currentTraceId() };
      handlerDone = handler(outboxEvent);
    });
    await handlerDone;

    expect(outboxEvent?.traceId).toBe("req-42");
    expect(lines.map((line) => line["trace_id"])).toEqual(["req-42", "req-42"]);
    expect(lines.map((line) => line["msg"])).toEqual(["request started", "projection updated"]);
  });
});
