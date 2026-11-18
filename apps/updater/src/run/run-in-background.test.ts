// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import type { Logger } from "@offgrid/observability";
import type { UpdateStatus } from "../types.js";
import { runInBackground } from "./run-in-background.js";

const silentLogger = (): Logger => {
  const logger: Logger = {
    debug: () => undefined,
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
    child: () => logger,
  };
  return logger;
};

const waitUntil = async (condition: () => boolean): Promise<void> => {
  for (let attempt = 0; attempt < 100 && !condition(); attempt += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
};

describe("runInBackground", () => {
  it("releases the run lock after the job succeeds", async () => {
    let released = false;
    const job = async () => ({ outcome: "succeeded" }) as UpdateStatus;

    runInBackground(silentLogger(), () => (released = true), job);
    await waitUntil(() => released);

    expect(released).toBe(true);
  });

  it("releases the run lock after the job throws", async () => {
    let released = false;
    const job = async (): Promise<UpdateStatus> => {
      throw new Error("docker socket closed");
    };

    runInBackground(silentLogger(), () => (released = true), job);
    await waitUntil(() => released);

    expect(released).toBe(true);
  });
});
