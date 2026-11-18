// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Readable } from "node:stream";
import type { ModuleDatabase } from "@offgrid/db";
import { createLogger } from "@offgrid/observability";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInMemoryFileStorage } from "../../infrastructure/storage/in-memory-file-storage.js";
import { createStorageIntegritySweepWorker } from "./create-storage-integrity-sweep-worker.js";

const INTERVAL_MS = 24 * 60 * 60 * 1000;
const FIRST_RUN_DELAY_MS = 1_000;
const HOUR_MS = 60 * 60 * 1000;

const emptyTransactionDb = (onTransaction: () => void) => {
  const tx = {
    $executeRawUnsafe: async () => 0,
    filesFileVersion: { findMany: async () => [] },
  };
  return {
    $transaction: async (run: (client: typeof tx) => Promise<unknown>) => {
      onTransaction();
      return run(tx);
    },
  } as unknown as ModuleDatabase;
};

const recordingLogger = () => {
  const lines: string[] = [];
  const logger = createLogger({ sink: (line) => lines.push(line) });
  return { logger, lines };
};

const workerOver = (db: ModuleDatabase, storage = createInMemoryFileStorage(), logger = recordingLogger().logger) =>
  createStorageIntegritySweepWorker({
    db,
    storage,
    logger,
    now: () => new Date(Date.now()),
    intervalMs: INTERVAL_MS,
    firstRunDelayMs: FIRST_RUN_DELAY_MS,
  });

describe("storage integrity sweep worker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs once after the first delay and then once per interval", async () => {
    let transactions = 0;
    const worker = workerOver(emptyTransactionDb(() => (transactions += 1)));
    await worker.start();

    await vi.advanceTimersByTimeAsync(FIRST_RUN_DELAY_MS - 1);
    expect(transactions).toBe(0);

    await vi.advanceTimersByTimeAsync(1);
    expect(transactions).toBe(1);

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(transactions).toBe(2);
    await worker.stop();
  });

  it("does not start a sweep while the previous one is still running", async () => {
    let transactions = 0;
    let finish: (() => void) | undefined;
    const hangingDb = {
      $transaction: () => {
        transactions += 1;
        return new Promise<unknown[]>((resolve) => {
          finish = () => resolve([]);
        });
      },
    } as unknown as ModuleDatabase;
    const worker = workerOver(hangingDb);
    await worker.start();

    await vi.advanceTimersByTimeAsync(FIRST_RUN_DELAY_MS + INTERVAL_MS);
    expect(transactions).toBe(1);

    finish?.();
    await worker.stop();
  });

  it("logs counts and never a storage key", async () => {
    const storage = createInMemoryFileStorage();
    const stored = await storage.put(Readable.from([Buffer.from("orphan bytes")]));
    const { logger, lines } = recordingLogger();
    const worker = createStorageIntegritySweepWorker({
      db: emptyTransactionDb(() => undefined),
      storage,
      logger,
      now: () => new Date(Date.now() + 2 * HOUR_MS),
      intervalMs: INTERVAL_MS,
      firstRunDelayMs: FIRST_RUN_DELAY_MS,
    });
    await worker.start();

    await vi.advanceTimersByTimeAsync(FIRST_RUN_DELAY_MS);
    await worker.stop();

    const output = lines.join("\n");
    expect(output).toContain("files storage integrity sweep found differences");
    expect(output).toContain('"orphanCount":1');
    expect(output).not.toContain(stored.key);
  });

  it("logs the error name and keeps running when a sweep fails", async () => {
    const failingDb = {
      $transaction: async () => {
        throw new TypeError("database is unreachable");
      },
    } as unknown as ModuleDatabase;
    const { logger, lines } = recordingLogger();
    const worker = workerOver(failingDb, createInMemoryFileStorage(), logger);
    await worker.start();

    await vi.advanceTimersByTimeAsync(FIRST_RUN_DELAY_MS);
    await worker.stop();

    const output = lines.join("\n");
    expect(output).toContain("files storage integrity sweep failed");
    expect(output).toContain("TypeError");
    expect(output).not.toContain("database is unreachable");
  });
});
