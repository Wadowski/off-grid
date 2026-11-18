// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleDatabase } from "@offgrid/db";
import { createLogger } from "@offgrid/observability";
import { describe, expect, it } from "vitest";
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
});
