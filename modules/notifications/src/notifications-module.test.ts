// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import { REALTIME_WORKER_NAME } from "./constants.js";
import { createNotificationsModule } from "./notifications-module.js";

describe("createNotificationsModule", () => {
  it("provides one realtime worker", () => {
    const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), child: vi.fn() };
    const workers = createNotificationsModule().workers({ logger: logger as unknown as Logger });

    expect(workers.map((worker) => worker.name)).toEqual([REALTIME_WORKER_NAME]);
  });
});
