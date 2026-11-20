// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFileStatusStore } from "../apply/create-file-status-store.js";
import { readUpdateStatus } from "../apply/read-update-status.js";
import { applyUpdate } from "../apply/apply-update.js";
import { createManualClock } from "../../test/manual-clock.js";
import { createFakeClock } from "../../test/fake-clock.js";
import { createFakeDockerRunner } from "../../test/fake-docker-runner.js";
import { fakeReleaseSource, RELEASE_REPOSITORY } from "../../test/fake-release-source.js";
import { createSilentLogger } from "../../test/silent-logger.js";
import { waitUntil } from "../../test/wait-until.js";
import { createRunLock } from "../run/create-run-lock.js";
import type { ManualClock, NightlyIntegrationHarness } from "../../test/types.js";
import type { ApplyDependencies, DockerRunner, HttpFetch, UpdaterServices } from "../types.js";
import { runNightlyUpdate } from "./run-nightly-update.js";
import { readNightlySetting } from "./read-nightly-setting.js";
import { startNightlyScheduler } from "./start-nightly-scheduler.js";

const SERVER_URL = "http://server.internal:3000";
const API_TOKEN = "updater-test-token-value";
const CURRENT_VERSION = "1.2.3";
const TARGET_VERSION = "1.2.4";
const OLD_SERVER = `ghcr.io/owner/offgrid-main-server@sha256:${"a".repeat(64)}`;
const OLD_WEB = `ghcr.io/owner/offgrid-main-web@sha256:${"b".repeat(64)}`;
const NIGHTLY_TIME = { hour: 3, minute: 30 };
const START = new Date(2026, 10, 19, 10, 0);
const NIGHT_SLOT = new Date(2026, 10, 20, 3, 30);
const LATER_SAME_NIGHT = new Date(2026, 10, 20, 4, 10);

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

const buildServices = (
  statusFile: string,
  githubFetch: HttpFetch,
  dockerCalls: string[],
  pullFails: boolean,
): UpdaterServices => {
  const failures = pullFails ? new Map([["pullImage", new Error("pull denied")]]) : new Map();
  const docker: DockerRunner = createFakeDockerRunner(dockerCalls, failures, {
    server: OLD_SERVER,
    web: OLD_WEB,
  });
  const dependencies: ApplyDependencies = {
    docker,
    backup: {
      create: async (version) => ({ name: `backup-${version}` }),
      restore: async () => undefined,
    },
    statusStore: createFileStatusStore(statusFile),
    health: { server: async () => true, web: async () => true },
    clock: createFakeClock(),
    healthTimeoutMilliseconds: 1000,
  };
  return {
    apiToken: API_TOKEN,
    statusFile,
    releaseRepository: RELEASE_REPOSITORY,
    runLock: createRunLock(),
    httpFetch: githubFetch,
    logger: createSilentLogger(),
    currentVersion: async () => CURRENT_VERSION,
    runApply: (request) => applyUpdate(dependencies, request),
  };
};

describe("nightly update through the scheduler", () => {
  let directory: string;

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "offgrid-updater-nightly-"));
  });

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  const startHarness = (enabled: boolean, pullFails = false): NightlyIntegrationHarness => {
    const statusFile = join(directory, "status.json");
    const githubCalls: string[] = [];
    const serverCalls: string[] = [];
    const dockerCalls: string[] = [];
    const githubSource = fakeReleaseSource();
    const githubFetch: HttpFetch = async (url, init) => {
      githubCalls.push(url);
      return githubSource(url, init);
    };
    const services = buildServices(statusFile, githubFetch, dockerCalls, pullFails);
    const clock = createManualClock(START);
    const serverFetch = async (url: string): Promise<Response> => {
      serverCalls.push(url);
      return jsonResponse({ enabled });
    };
    const stop = startNightlyScheduler({
      clock,
      nightlyTime: NIGHTLY_TIME,
      logger: createSilentLogger(),
      runTick: () =>
        runNightlyUpdate(services, () => readNightlySetting(SERVER_URL, API_TOKEN, serverFetch)),
    });
    return { clock, statusFile, githubCalls, serverCalls, dockerCalls, stop };
  };

  const waitForTickToFinish = (clock: ManualClock): Promise<void> =>
    waitUntil(() => clock.pendingSleeps() === 1);

  it("applies the newer release once and records the succeeded run in the status file", async () => {
    const harness = startHarness(true);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(NIGHT_SLOT);
    await waitForTickToFinish(harness.clock);
    harness.stop();

    const status = await readUpdateStatus(harness.statusFile);
    expect(status?.outcome).toBe("succeeded");
    expect(status?.targetVersion).toBe(TARGET_VERSION);
    expect(harness.serverCalls).toHaveLength(1);
    expect(harness.githubCalls.length).toBeGreaterThan(0);
  });

  it("makes no GitHub call when the setting is off and only calls the server", async () => {
    const harness = startHarness(false);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(NIGHT_SLOT);
    await waitForTickToFinish(harness.clock);
    harness.stop();

    expect(harness.serverCalls).toHaveLength(1);
    expect(harness.githubCalls).toEqual([]);
    expect(harness.dockerCalls).toEqual([]);
    expect(await readUpdateStatus(harness.statusFile)).toBeNull();
  });

  it("records a failed night and does not try again the same night", async () => {
    const harness = startHarness(true, true);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);

    harness.clock.advanceTo(NIGHT_SLOT);
    await waitForTickToFinish(harness.clock);
    const callsAfterFailedNight = harness.dockerCalls.length;
    harness.clock.advanceTo(LATER_SAME_NIGHT);
    await waitUntil(() => harness.clock.pendingSleeps() === 1);
    harness.stop();

    const status = await readUpdateStatus(harness.statusFile);
    expect(status?.outcome).toBe("failed_before_change");
    expect(harness.serverCalls).toHaveLength(1);
    expect(harness.dockerCalls).toHaveLength(callsAfterFailedNight);
  });
});
