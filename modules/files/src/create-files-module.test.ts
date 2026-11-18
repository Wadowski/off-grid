// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import type { EventBus } from "@offgrid/event-bus";
import { createLogger } from "@offgrid/observability";
import { describe, expect, it, vi } from "vitest";
import { createFilesModule } from "./create-files-module.js";

describe("createFilesModule", () => {
  it("names the module files and registers the storage integrity sweep worker", () => {
    const module = createFilesModule({ directory: "/data/files" });
    const workers = module.workers({
      db: {} as ModuleDatabase,
      logger: createLogger({ sink: () => undefined }),
    });

    expect(module.name).toBe("files");
    expect(workers.map((worker) => worker.name)).toEqual(["files-storage-integrity-sweep"]);
  });

  it("registers one family membership subscription that halts on failure", () => {
    const module = createFilesModule({ directory: "/data/files" });
    const subscribeToEvents = vi.fn();

    module.registerSubscribers({
      eventBus: { subscribeToEvents } as unknown as EventBus,
      db: {} as ModuleDatabase,
    });

    expect(subscribeToEvents).toHaveBeenCalledTimes(1);
    expect(subscribeToEvents).toHaveBeenCalledWith(
      expect.objectContaining({ name: "files-family-membership", runAs: "files", onFailure: "halt" }),
    );
  });
});
