// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { createMemoryErrorSink } from "./create-memory-error-sink.js";
import type { ErrorRecord } from "./types.js";

const NOW = new Date("2026-11-06T12:00:00.000Z");

describe("createMemoryErrorSink", () => {
  it("passes each recorded error to persist", async () => {
    const persist = vi.fn<(record: ErrorRecord) => Promise<void>>(async () => undefined);
    const sink = createMemoryErrorSink({ now: () => NOW, persist });

    sink.record(new TypeError("boom"), { route: "/api/me" });

    await vi.waitFor(() =>
      expect(persist).toHaveBeenCalledWith(
        expect.objectContaining({ name: "TypeError", recorded_at: NOW.toISOString() }),
      ),
    );
  });

  it("redacts sensitive context before persisting", async () => {
    const persist = vi.fn<(record: ErrorRecord) => Promise<void>>(async () => undefined);
    const sink = createMemoryErrorSink({ now: () => NOW, persist });

    sink.record(new Error("boom"), { route: "/api/me", password: "secret" });

    await vi.waitFor(() =>
      expect(persist).toHaveBeenCalledWith(
        expect.objectContaining({ context: { route: "/api/me", password: "[REDACTED]" } }),
      ),
    );
  });

  it("keeps the record in memory when persist rejects, without throwing", async () => {
    const persist = vi.fn<(record: ErrorRecord) => Promise<void>>(async () => {
      throw new Error("database is down");
    });
    const sink = createMemoryErrorSink({ persist });

    expect(() => sink.record(new Error("first"))).not.toThrow();
    await vi.waitFor(() => expect(persist).toHaveBeenCalledTimes(1));

    expect(sink.list()).toHaveLength(1);
  });

  it("skips persisting once the pending writes reach the cap", async () => {
    const persist = vi.fn(() => new Promise<void>(() => undefined));
    const sink = createMemoryErrorSink({ persist, maxPendingWrites: 2 });

    sink.record(new Error("one"));
    sink.record(new Error("two"));
    sink.record(new Error("three"));
    await Promise.resolve();

    expect(persist).toHaveBeenCalledTimes(2);
    expect(sink.list()).toHaveLength(3);
  });
});
