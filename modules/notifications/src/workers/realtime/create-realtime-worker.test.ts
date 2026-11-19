// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it, vi } from "vitest";
import { REALTIME_WORKER_NAME } from "../../constants.js";
import type { NotificationHub } from "../../types.js";
import { createRealtimeWorker } from "./create-realtime-worker.js";

const hubSpy = (): NotificationHub & { close: ReturnType<typeof vi.fn> } => ({
  subscribe: vi.fn(() => () => undefined),
  publish: vi.fn(),
  close: vi.fn(),
});

describe("createRealtimeWorker", () => {
  it("is named for the realtime hub", () => {
    expect(createRealtimeWorker(hubSpy()).name).toBe(REALTIME_WORKER_NAME);
  });

  it("closes the hub when it stops", async () => {
    const hub = hubSpy();
    const worker = createRealtimeWorker(hub);

    await worker.start();
    await worker.stop();

    expect(hub.close).toHaveBeenCalledTimes(1);
  });
});
