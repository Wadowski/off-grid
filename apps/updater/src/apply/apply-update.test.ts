// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { createFakeClock } from "../../test/fake-clock.js";
import { createFakeDockerRunner } from "../../test/fake-docker-runner.js";
import type {
  FakeDockerMethod,
  Harness,
  HarnessOptions,
  HealthMode,
  BackupFailures,
} from "../../test/types.js";
import { FORWARD_STEP_NAMES, ROLLBACK_STEP_NAMES } from "@offgrid/contracts";
import type {
  ApplyDependencies,
  BackupService,
  HealthProbes,
  ImageReferences,
  UpdateStatus,
  UpdateStepName,
} from "../types.js";
import { applyUpdate } from "./apply-update.js";
import { UpdateRefusedError } from "./errors/update-refused-error.js";

const BACKUP_NAME = "offgrid-1.4.0-20261117T194500Z";

const RUNNING_IMAGES: ImageReferences = {
  server: `ghcr.io/offgrid/offgrid-main-server@sha256:${"c".repeat(64)}`,
  web: `ghcr.io/offgrid/offgrid-main-web@sha256:${"d".repeat(64)}`,
};

const NEW_IMAGES: ImageReferences = {
  server: `ghcr.io/offgrid/offgrid-main-server@sha256:${"a".repeat(64)}`,
  web: `ghcr.io/offgrid/offgrid-main-web@sha256:${"b".repeat(64)}`,
};

const buildManifest = (version: string, minimumPreviousVersion = "1.0.0") => ({
  schemaVersion: 1,
  version,
  commit: "a".repeat(40),
  images: {
    server: { reference: NEW_IMAGES.server, platforms: ["linux/amd64"] },
    web: { reference: NEW_IMAGES.web, platforms: ["linux/amd64"] },
  },
  minimumPreviousVersion,
});

const buildRequest = (currentVersion = "1.4.0", manifest = buildManifest("1.5.0")) => ({
  currentVersion,
  manifest,
});

const newReleaseRunning = (calls: readonly string[]): boolean =>
  calls.some((call) => call.startsWith("replace:")) &&
  !calls.some((call) => call.startsWith("start:"));

const isServiceHealthy = (
  calls: readonly string[],
  mode: HealthMode,
  service: "server" | "web",
): boolean => {
  if (mode === "never") {
    return false;
  }
  if (mode === "healthy") {
    return true;
  }
  return !(mode === `${service}-until-rollback` && newReleaseRunning(calls));
};

const createHealthProbes = (calls: string[], mode: HealthMode): HealthProbes => ({
  server: async () => isServiceHealthy(calls, mode, "server"),
  web: async () => isServiceHealthy(calls, mode, "web"),
});

const createBackupService = (calls: string[], failures: BackupFailures): BackupService => ({
  create: async (version) => {
    calls.push(`backup:${version}`);
    if (failures.create === true) {
      throw new Error("backup failed");
    }
    return { name: BACKUP_NAME };
  },
  restore: async (name) => {
    calls.push(`restore:${name}`);
    if (failures.restore === true) {
      throw new Error("restore failed");
    }
  },
});

const createHarness = (options: HarnessOptions = {}): Harness => {
  const calls: string[] = [];
  const writes: UpdateStatus[] = [];
  let statusWriteFailed = false;
  const dependencies: ApplyDependencies = {
    docker: createFakeDockerRunner(
      calls,
      options.failingMethods ?? new Map<FakeDockerMethod, Error>(),
      RUNNING_IMAGES,
    ),
    backup: createBackupService(calls, options.backupFailures ?? {}),
    statusStore: {
      write: async (status) => {
        if (!statusWriteFailed && options.statusWriteFailure?.(status) === true) {
          statusWriteFailed = true;
          throw new Error("status write failed");
        }
        writes.push(structuredClone(status));
      },
    },
    health: createHealthProbes(calls, options.health ?? "healthy"),
    clock: createFakeClock(),
    healthTimeoutMilliseconds: 5000,
  };
  return { dependencies, calls, writes };
};

const failing = (...methods: FakeDockerMethod[]): ReadonlyMap<FakeDockerMethod, Error> =>
  new Map(
    methods.map((method): [FakeDockerMethod, Error] => [method, new Error(`${method} failed`)]),
  );

const stateOf = (status: UpdateStatus, name: UpdateStepName) =>
  status.steps.find((step) => step.name === name)?.state;

const distinctConsecutive = <Value>(values: readonly Value[]): Value[] =>
  values.filter((value, index) => index === 0 || value !== values[index - 1]);

const countCalls = (calls: readonly string[], call: string): number =>
  calls.filter((entry) => entry === call).length;

const PULL_CALLS = [`pull:${NEW_IMAGES.server}`, `pull:${NEW_IMAGES.web}`];
const BACKUP_CALL = "backup:1.4.0";
const INSPECT_CALL = "inspect";
const MIGRATE_CALL = `migrate:${NEW_IMAGES.server}`;
const REPLACE_CALL = `replace:${NEW_IMAGES.server}|${NEW_IMAGES.web}`;
const STOP_CALL = "stop";
const RESTORE_CALL = `restore:${BACKUP_NAME}`;
const START_CALL = `start:${RUNNING_IMAGES.server}|${RUNNING_IMAGES.web}`;

describe("applyUpdate", () => {
  describe("happy path", () => {
    it("reports succeeded after backup, pull by digest, migrate, replace and health", async () => {
      const harness = createHarness();

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("succeeded");
      expect(status.failedStep).toBeNull();
      expect(status.backupName).toBe(BACKUP_NAME);
      expect(status.previousImages).toEqual(RUNNING_IMAGES);
      expect(status.writesAfterBackupLost).toBe(false);
      expect(harness.calls).toEqual([
        BACKUP_CALL,
        INSPECT_CALL,
        ...PULL_CALLS,
        MIGRATE_CALL,
        REPLACE_CALL,
      ]);
    });

    it("marks every forward step succeeded", async () => {
      const harness = createHarness();

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.steps.map((step) => [step.name, step.state])).toEqual(
        FORWARD_STEP_NAMES.map((name) => [name, "succeeded"]),
      );
    });

    it.each(FORWARD_STEP_NAMES)(
      "writes %s as running before it is written as succeeded",
      async (name) => {
        const harness = createHarness();

        await applyUpdate(harness.dependencies, buildRequest());

        const states = distinctConsecutive(harness.writes.map((write) => stateOf(write, name)));
        expect(states).toEqual(["pending", "running", "succeeded"]);
      },
    );
  });

  describe("refusals", () => {
    it("refuses a target that is not newer, before any backup or Docker call", async () => {
      const harness = createHarness();

      const status = await applyUpdate(
        harness.dependencies,
        buildRequest("1.5.0", buildManifest("1.5.0")),
      );

      expect(status.outcome).toBe("refused");
      expect(status.failedStep).toBe("verify_version");
      expect(harness.calls).toEqual([]);
    });

    it("refuses a current version below the minimum previous version", async () => {
      const harness = createHarness();

      const status = await applyUpdate(
        harness.dependencies,
        buildRequest("1.0.0", buildManifest("1.5.0", "1.2.0")),
      );

      expect(status.outcome).toBe("refused");
      expect(status.failedStep).toBe("verify_version");
      expect(harness.calls).toEqual([]);
    });

    it("throws UpdateRefusedError for an invalid manifest and writes no status", async () => {
      const harness = createHarness();

      await expect(
        applyUpdate(harness.dependencies, {
          currentVersion: "1.4.0",
          manifest: { schemaVersion: 2 },
        }),
      ).rejects.toBeInstanceOf(UpdateRefusedError);

      expect(harness.writes).toEqual([]);
      expect(harness.calls).toEqual([]);
    });
  });

  describe("failures before any change", () => {
    it("stops at a failed backup with no pull and no container change", async () => {
      const harness = createHarness({ backupFailures: { create: true } });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_before_change");
      expect(status.failedStep).toBe("backup");
      expect(harness.calls).toEqual([BACKUP_CALL]);
      expect(stateOf(status, "pull")).toBe("skipped");
    });

    it("stops at a failed pull and keeps the backup without restoring it", async () => {
      const harness = createHarness({ failingMethods: failing("pullImage") });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_before_change");
      expect(status.failedStep).toBe("pull");
      expect(status.backupName).toBe(BACKUP_NAME);
      expect(harness.calls).toEqual([BACKUP_CALL, INSPECT_CALL, PULL_CALLS[0]]);
      expect(stateOf(status, "migrate")).toBe("skipped");
      expect(stateOf(status, "replace")).toBe("skipped");
    });
  });

  describe("rollback after a failure in migrate, replace or health", () => {
    it("rolls back when the migration fails", async () => {
      const harness = createHarness({ failingMethods: failing("runInitJob") });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("migrate");
      expect(status.writesAfterBackupLost).toBe(true);
      expect(harness.calls).toEqual([
        BACKUP_CALL,
        INSPECT_CALL,
        ...PULL_CALLS,
        MIGRATE_CALL,
        STOP_CALL,
        RESTORE_CALL,
        START_CALL,
      ]);
      expect(stateOf(status, "rollback_health")).toBe("succeeded");
    });

    it("rolls back when replacing the containers fails", async () => {
      const harness = createHarness({ failingMethods: failing("replaceContainers") });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("replace");
      expect(status.writesAfterBackupLost).toBe(true);
    });

    it("rolls back when the server does not become healthy", async () => {
      const harness = createHarness({ health: "server-until-rollback" });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("health");
      expect(harness.calls.slice(-3)).toEqual([STOP_CALL, RESTORE_CALL, START_CALL]);
    });

    it("rolls back when the web app does not become healthy", async () => {
      const harness = createHarness({ health: "web-until-rollback" });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("health");
      expect(status.writesAfterBackupLost).toBe(true);
    });

    it("writes the rollback steps into the status", async () => {
      const harness = createHarness({ failingMethods: failing("runInitJob") });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.steps.map((step) => step.name)).toEqual([
        ...FORWARD_STEP_NAMES,
        ...ROLLBACK_STEP_NAMES,
      ]);
      expect(stateOf(status, "replace")).toBe("skipped");
    });
  });

  describe("unexpected errors", () => {
    it("rolls back when a forward step throws something other than a step failure", async () => {
      const harness = createHarness({
        failingMethods: new Map<FakeDockerMethod, Error>([
          ["runInitJob", new TypeError("unexpected")],
        ]),
      });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("migrate");
      expect(status.writesAfterBackupLost).toBe(true);
      expect(harness.calls.slice(-3)).toEqual([STOP_CALL, RESTORE_CALL, START_CALL]);
    });

    it("ends failed_needs_admin when a rollback step throws something other than a step failure", async () => {
      const harness = createHarness({
        failingMethods: new Map<FakeDockerMethod, Error>([
          ["runInitJob", new Error("migrate failed")],
          ["startContainers", new TypeError("unexpected")],
        ]),
      });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_needs_admin");
      expect(status.failedStep).toBe("rollback_start");
      expect(status.writesAfterBackupLost).toBe(true);
      expect(stateOf(status, "rollback_health")).toBe("skipped");
    });

    it("rolls back when the status write after a container change fails", async () => {
      const harness = createHarness({
        statusWriteFailure: (status) => stateOf(status, "migrate") === "succeeded",
      });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("migrate");
      expect(harness.calls.slice(-3)).toEqual([STOP_CALL, RESTORE_CALL, START_CALL]);
    });

    it("keeps the original failure when writing the failed state also fails", async () => {
      const harness = createHarness({
        failingMethods: failing("replaceContainers"),
        statusWriteFailure: (status) => stateOf(status, "replace") === "failed",
      });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("rolled_back");
      expect(status.failedStep).toBe("replace");
      expect(harness.calls.slice(-3)).toEqual([STOP_CALL, RESTORE_CALL, START_CALL]);
    });
  });

  describe("failed rollback", () => {
    it("ends failed_needs_admin when stopping the containers fails, without retrying", async () => {
      const harness = createHarness({ failingMethods: failing("runInitJob", "stopContainers") });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_needs_admin");
      expect(status.failedStep).toBe("rollback_stop");
      expect(status.writesAfterBackupLost).toBe(false);
      expect(countCalls(harness.calls, STOP_CALL)).toBe(1);
      expect(harness.calls.some((call) => call.startsWith("restore:"))).toBe(false);
      expect(stateOf(status, "rollback_restore")).toBe("skipped");
      expect(stateOf(status, "rollback_start")).toBe("skipped");
      expect(stateOf(status, "rollback_health")).toBe("skipped");
    });

    it("ends failed_needs_admin when the restore fails, without retrying", async () => {
      const harness = createHarness({
        failingMethods: failing("runInitJob"),
        backupFailures: { restore: true },
      });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_needs_admin");
      expect(status.failedStep).toBe("rollback_restore");
      expect(status.writesAfterBackupLost).toBe(false);
      expect(countCalls(harness.calls, RESTORE_CALL)).toBe(1);
      expect(harness.calls.some((call) => call.startsWith("start:"))).toBe(false);
    });

    it("ends failed_needs_admin when starting the previous images fails, keeping the data-loss flag", async () => {
      const harness = createHarness({ failingMethods: failing("runInitJob", "startContainers") });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_needs_admin");
      expect(status.failedStep).toBe("rollback_start");
      expect(status.writesAfterBackupLost).toBe(true);
      expect(countCalls(harness.calls, START_CALL)).toBe(1);
      expect(stateOf(status, "rollback_health")).toBe("skipped");
    });

    it("ends failed_needs_admin when the previous version does not become healthy", async () => {
      const harness = createHarness({ health: "never" });

      const status = await applyUpdate(harness.dependencies, buildRequest());

      expect(status.outcome).toBe("failed_needs_admin");
      expect(status.failedStep).toBe("rollback_health");
      expect(status.writesAfterBackupLost).toBe(true);
      expect(countCalls(harness.calls, START_CALL)).toBe(1);
    });
  });
});
