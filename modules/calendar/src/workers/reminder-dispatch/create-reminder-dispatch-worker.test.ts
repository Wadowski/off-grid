// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { createLogger } from "@offgrid/observability";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReminderDispatchWorker } from "./create-reminder-dispatch-worker.js";

const INTERVAL_MS = 1_000;

const pendingTransactions = () => {
  const finishers: ((count: number) => void)[] = [];
  const db = {
    $transaction: () =>
      new Promise<number>((resolve) => {
        finishers.push(resolve);
      }),
  } as unknown as ModuleDatabase;
  return { db, finishers };
};

const workerOver = (db: ModuleDatabase) =>
  createReminderDispatchWorker({
    db,
    logger: createLogger({ sink: () => undefined }),
    now: () => new Date("2026-11-20T08:45:00Z"),
    intervalMs: INTERVAL_MS,
  });

describe("reminder dispatch worker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts no tick while the previous tick is still running", async () => {
    const { db, finishers } = pendingTransactions();
    const worker = workerOver(db);
    await worker.start();

    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 5);
    expect(finishers).toHaveLength(1);

    finishers[0]?.(0);
    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(finishers).toHaveLength(2);

    finishers[1]?.(0);
    await worker.stop();
  });

  it("waits for the running tick when it stops", async () => {
    const { db, finishers } = pendingTransactions();
    const worker = workerOver(db);
    await worker.start();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS);

    let stopped = false;
    const stopping = worker.stop().then(() => {
      stopped = true;
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(stopped).toBe(false);

    finishers[0]?.(0);
    await stopping;
    expect(stopped).toBe(true);
  });
});
