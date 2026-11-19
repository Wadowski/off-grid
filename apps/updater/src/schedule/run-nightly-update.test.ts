// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import {
  fakeReleaseSource,
  RELEASE_REPOSITORY,
  releaseManifestFixture,
} from "../../test/fake-release-source.js";
import { createSilentLogger } from "../../test/silent-logger.js";
import type { NightlyTickHarness } from "../../test/types.js";
import { createRunLock } from "../run/create-run-lock.js";
import type { ApplyRequest, HttpFetch, UpdateStatus, UpdaterServices } from "../types.js";
import { runNightlyUpdate } from "./run-nightly-update.js";

const RUNNING_VERSION = "1.2.3";
const OLDER_RUNNING_VERSION = "0.9.0";
const UP_TO_DATE_VERSION = "1.2.4";

const statusFixture = (): UpdateStatus => ({
  runId: "3f1c2a4e-6b7d-4e8f-9a0b-1c2d3e4f5a6b",
  currentVersion: RUNNING_VERSION,
  targetVersion: "1.2.4",
  startedAt: "2026-11-19T03:30:00.000Z",
  finishedAt: "2026-11-19T03:35:00.000Z",
  outcome: "succeeded",
  failedStep: null,
  steps: [],
  backupName: null,
  previousImages: null,
  writesAfterBackupLost: false,
  message: "Update finished and the new version is healthy.",
});

const buildHarness = (
  overrides: {
    readonly currentVersion?: string;
    readonly httpFetch?: HttpFetch;
    readonly runApply?: (request: ApplyRequest) => Promise<UpdateStatus>;
  } = {},
): NightlyTickHarness => {
  const releaseCalls: string[] = [];
  const applyRequests: ApplyRequest[] = [];
  const releaseSource = fakeReleaseSource();
  const services: UpdaterServices = {
    apiToken: "updater-test-token-value",
    statusFile: "unused/status.json",
    releaseRepository: RELEASE_REPOSITORY,
    runLock: createRunLock(),
    httpFetch: async (url, init) => {
      releaseCalls.push(url);
      return overrides.httpFetch ? overrides.httpFetch(url, init) : releaseSource(url, init);
    },
    logger: createSilentLogger(),
    currentVersion: async () => overrides.currentVersion ?? RUNNING_VERSION,
    runApply: async (request) => {
      applyRequests.push(request);
      return overrides.runApply ? overrides.runApply(request) : statusFixture();
    },
  };
  return { services, releaseCalls, applyRequests };
};

const settingReturning =
  (enabled: boolean, reads: number[] = []) =>
  async (): Promise<boolean> => {
    reads.push(1);
    return enabled;
  };

const failingSetting = async (): Promise<boolean> => {
  throw new Error("nightly setting could not be read");
};

describe("runNightlyUpdate", () => {
  it("makes no release-source call and no apply when the setting is off", async () => {
    const harness = buildHarness();

    const result = await runNightlyUpdate(harness.services, settingReturning(false));

    expect(result).toBe("disabled");
    expect(harness.releaseCalls).toEqual([]);
    expect(harness.applyRequests).toEqual([]);
  });

  it("makes no release-source call and no apply when the setting cannot be read", async () => {
    const harness = buildHarness();

    const result = await runNightlyUpdate(harness.services, failingSetting);

    expect(result).toBe("setting_unreadable");
    expect(harness.releaseCalls).toEqual([]);
    expect(harness.applyRequests).toEqual([]);
    expect(harness.services.runLock.isHeld()).toBe(false);
  });

  it("applies once with the loaded manifest when the setting is on and a newer release is allowed", async () => {
    const harness = buildHarness();

    const result = await runNightlyUpdate(harness.services, settingReturning(true));

    expect(result).toBe("applied");
    expect(harness.applyRequests).toEqual([
      { currentVersion: RUNNING_VERSION, manifest: releaseManifestFixture() },
    ]);
    expect(harness.services.runLock.isHeld()).toBe(false);
  });

  it("does not apply and writes nothing when no newer release exists", async () => {
    let applied = false;
    const harness = buildHarness({
      currentVersion: UP_TO_DATE_VERSION,
      runApply: async () => {
        applied = true;
        return statusFixture();
      },
    });

    const result = await runNightlyUpdate(harness.services, settingReturning(true));

    expect(result).toBe("no_update");
    expect(applied).toBe(false);
    expect(harness.services.runLock.isHeld()).toBe(false);
  });

  it("does not apply when the running version is below the minimum the release accepts", async () => {
    const harness = buildHarness({ currentVersion: OLDER_RUNNING_VERSION });

    const result = await runNightlyUpdate(harness.services, settingReturning(true));

    expect(result).toBe("update_not_allowed");
    expect(harness.applyRequests).toEqual([]);
    expect(harness.services.runLock.isHeld()).toBe(false);
  });

  it("skips without any call when a manual update holds the run lock", async () => {
    const harness = buildHarness();
    const settingReads: number[] = [];
    const heldRelease = harness.services.runLock.tryAcquire();

    const result = await runNightlyUpdate(harness.services, settingReturning(true, settingReads));

    expect(result).toBe("run_in_progress");
    expect(settingReads).toEqual([]);
    expect(harness.releaseCalls).toEqual([]);
    expect(harness.applyRequests).toEqual([]);
    expect(harness.services.runLock.isHeld()).toBe(true);
    heldRelease?.();
  });

  it("does not apply when the release source cannot be read", async () => {
    const harness = buildHarness({
      httpFetch: async () => {
        throw new Error("offline");
      },
    });

    const result = await runNightlyUpdate(harness.services, settingReturning(true));

    expect(result).toBe("release_unavailable");
    expect(harness.applyRequests).toEqual([]);
    expect(harness.services.runLock.isHeld()).toBe(false);
  });

  it("reports a failed apply and releases the run lock", async () => {
    const harness = buildHarness({
      runApply: async () => {
        throw new Error("pull denied");
      },
    });

    const result = await runNightlyUpdate(harness.services, settingReturning(true));

    expect(result).toBe("failed");
    expect(harness.applyRequests).toHaveLength(1);
    expect(harness.services.runLock.isHeld()).toBe(false);
  });
});
