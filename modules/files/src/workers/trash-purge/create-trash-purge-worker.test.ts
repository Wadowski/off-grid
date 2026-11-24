// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { FileStorage } from "@offgrid/file-storage";
import type { Logger } from "@offgrid/observability";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTrashPurgeWorker } from "./create-trash-purge-worker.js";
import { runTrashPurge } from "./run-trash-purge.js";

vi.mock("./run-trash-purge.js", () => ({ runTrashPurge: vi.fn() }));

const options = {
  db: {} as ModuleDatabase,
  storage: {} as FileStorage,
  logger: {} as Logger,
  now: () => new Date("2026-12-01T00:00:00Z"),
  retentionDays: 30,
  intervalMs: 1000,
  firstRunDelayMs: 100,
};

describe("createTrashPurgeWorker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(runTrashPurge).mockReset();
    vi.mocked(runTrashPurge).mockResolvedValue(undefined);
  });

  afterEach(async () => {
    vi.useRealTimers();
  });

  it("runs once after the first-run delay and then on each interval", async () => {
    const worker = createTrashPurgeWorker(options);
    await worker.start();

    await vi.advanceTimersByTimeAsync(100);
    expect(runTrashPurge).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1000);
    expect(runTrashPurge).toHaveBeenCalledTimes(2);
    await worker.stop();
  });

  it("stops the timers so that no run starts after stop", async () => {
    const worker = createTrashPurgeWorker(options);
    await worker.start();
    await worker.stop();

    await vi.advanceTimersByTimeAsync(5000);
    expect(runTrashPurge).not.toHaveBeenCalled();
  });

  it("does not start a second run while one is still running", async () => {
    let release: () => void = () => undefined;
    vi.mocked(runTrashPurge).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const worker = createTrashPurgeWorker(options);
    await worker.start();

    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(1000);
    expect(runTrashPurge).toHaveBeenCalledTimes(1);
    release();
    await worker.stop();
  });
});
