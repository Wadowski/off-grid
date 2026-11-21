// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { createLogger } from "@offgrid/observability";
import { applyUpdate } from "../apply/apply-update.js";
import { createFileStatusStore } from "../apply/create-file-status-store.js";
import { createFakeClock } from "../../test/fake-clock.js";
import { createFakeDockerRunner } from "../../test/fake-docker-runner.js";
import { waitUntil } from "../../test/wait-until.js";
import { UPDATE_OUTCOMES } from "@offgrid/contracts";
import type { ApplyDependencies, DockerRunner, HttpFetch, UpdaterServices } from "../types.js";
import { createRunLock } from "../run/create-run-lock.js";
import { buildUpdaterApp } from "./build-updater-app.js";

const TOKEN = "updater-test-token-value";
const WRONG_TOKEN = "updater-wrong-token-value";
const CURRENT_VERSION = "1.2.3";
const TARGET_VERSION = "1.2.4";
const OLD_SERVER = `ghcr.io/owner/offgrid-main-server@sha256:${"a".repeat(64)}`;
const OLD_WEB = `ghcr.io/owner/offgrid-main-web@sha256:${"b".repeat(64)}`;
const NEW_SERVER = `ghcr.io/owner/offgrid-main-server@sha256:${"c".repeat(64)}`;
const NEW_WEB = `ghcr.io/owner/offgrid-main-web@sha256:${"d".repeat(64)}`;
const LATEST_RELEASE = "https://api.github.com/repos/owner/offgrid/releases/latest";
const TAGGED_RELEASE = `https://api.github.com/repos/owner/offgrid/releases/tags/v${TARGET_VERSION}`;
const MANIFEST_ASSET = "https://api.github.com/repos/owner/offgrid/releases/assets/7";
const MANIFEST_DOWNLOAD = "https://release-assets.githubusercontent.com/asset/7";
const AUTHORIZATION = `Bearer ${TOKEN}`;

const manifest = {
  schemaVersion: 1,
  version: TARGET_VERSION,
  commit: "b".repeat(40),
  images: {
    server: { reference: NEW_SERVER, platforms: ["linux/amd64"] },
    web: { reference: NEW_WEB, platforms: ["linux/amd64"] },
  },
  minimumPreviousVersion: "1.0.0",
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const releaseSource = (): HttpFetch => async (url) => {
  if (url === LATEST_RELEASE || url === TAGGED_RELEASE) {
    return jsonResponse({
      tag_name: `v${TARGET_VERSION}`,
      assets: [{ id: 7, name: "release-manifest.json" }],
    });
  }
  if (url === MANIFEST_ASSET) {
    return new Response(null, { status: 302, headers: { location: MANIFEST_DOWNLOAD } });
  }
  if (url === MANIFEST_DOWNLOAD) {
    return jsonResponse(manifest);
  }
  throw new Error(`unexpected request to ${url}`);
};

const statusBodySchema = z.object({
  update: z.object({ outcome: z.enum(UPDATE_OUTCOMES) }).nullable(),
});

describe("updater HTTP API", () => {
  let directory: string;
  let logLines: string[];
  let app: FastifyInstance;
  let gate: Promise<void> | null;
  let openGate: () => void;
  let failingPull: boolean;
  let releaseLockOwner: ReturnType<typeof createRunLock>;

  const buildApp = (): FastifyInstance => {
    const statusFile = join(directory, "status.json");
    const calls: string[] = [];
    const baseDocker: DockerRunner = createFakeDockerRunner(
      calls,
      failingPull ? new Map([["pullImage", new Error("pull denied")]]) : new Map(),
      { server: OLD_SERVER, web: OLD_WEB },
    );
    const docker: DockerRunner = {
      ...baseDocker,
      pullImage: async (reference) => {
        await gate;
        return baseDocker.pullImage(reference);
      },
    };
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
    const services: UpdaterServices = {
      apiToken: TOKEN,
      statusFile,
      releaseRepository: "owner/offgrid",
      runLock: releaseLockOwner,
      httpFetch: releaseSource(),
      logger: createLogger({ level: "debug", sink: (line) => logLines.push(line) }),
      currentVersion: async () => CURRENT_VERSION,
      runApply: (request) => applyUpdate(dependencies, request),
    };
    return buildUpdaterApp(services);
  };

  const authorized = (token = TOKEN) => ({ authorization: `Bearer ${token}` });

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "offgrid-updater-api-"));
    logLines = [];
    gate = null;
    openGate = () => undefined;
    failingPull = false;
    releaseLockOwner = createRunLock();
    app = buildApp();
  });

  afterEach(async () => {
    openGate();
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  });

  const blockPullsUntilOpened = (): void => {
    gate = new Promise<void>((resolve) => {
      openGate = resolve;
    });
  };

  const readStatusOutcome = async (): Promise<string | null> => {
    const response = await app.inject({ method: "GET", url: "/status", headers: authorized() });
    return statusBodySchema.parse(response.json()).update?.outcome ?? null;
  };

  describe("authentication", () => {
    it.each([
      ["GET", "/status"],
      ["POST", "/check"],
      ["POST", "/apply"],
      ["GET", "/no-such-route"],
    ])("answers %s %s without a token with 401 and a fixed body", async (method, url) => {
      const response = await app.inject({ method: method as "GET" | "POST", url });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "unauthorized" });
      expect(response.headers["www-authenticate"]).toBe("Bearer");
    });

    it("answers a wrong token with 401", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/status",
        headers: authorized(WRONG_TOKEN),
      });

      expect(response.statusCode).toBe(401);
    });

    it("answers a Basic authorization header with 401", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/status",
        headers: { authorization: `Basic ${Buffer.from(`user:${TOKEN}`).toString("base64")}` },
      });

      expect(response.statusCode).toBe(401);
    });

    it("keeps the token and the presented header out of the logs", async () => {
      await app.inject({ method: "GET", url: "/status", headers: authorized(WRONG_TOKEN) });
      await app.inject({ method: "GET", url: "/status", headers: authorized() });

      const logged = logLines.join("\n");
      expect(logged).not.toContain(TOKEN);
      expect(logged).not.toContain(AUTHORIZATION);
      expect(logged).not.toContain(WRONG_TOKEN);
      expect(logLines.length).toBeGreaterThan(0);
    });
  });

  describe("GET /status and POST /check", () => {
    it("returns no update before any run", async () => {
      const response = await app.inject({ method: "GET", url: "/status", headers: authorized() });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ update: null, running: false });
    });

    it("reports running while the run lock is held", async () => {
      const release = releaseLockOwner.tryAcquire();
      const response = await app.inject({ method: "GET", url: "/status", headers: authorized() });
      release?.();

      expect(response.json()).toEqual({ update: null, running: true });
    });

    it("reports the latest release without changing anything", async () => {
      const response = await app.inject({ method: "POST", url: "/check", headers: authorized() });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        currentVersion: CURRENT_VERSION,
        latestVersion: TARGET_VERSION,
        updateAvailable: true,
        updateAllowed: true,
      });
    });

    it("answers unknown routes with 404 for an authorized caller", async () => {
      const response = await app.inject({ method: "GET", url: "/nope", headers: authorized() });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "not_found" });
    });

    it("reports a corrupt status file as unreadable without its content", async () => {
      writeFileSync(join(directory, "status.json"), "{ not json secret-value");

      const response = await app.inject({ method: "GET", url: "/status", headers: authorized() });

      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual({ error: "status_unreadable" });
      expect(response.body).not.toContain("secret-value");
    });
  });

  describe("POST /apply", () => {
    it("starts the update with 202 and reports its success through GET /status", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: TARGET_VERSION },
      });

      expect(response.statusCode).toBe(202);
      expect(response.json()).toEqual({ started: true, targetVersion: TARGET_VERSION });
      await waitUntil(async () => (await readStatusOutcome()) === "succeeded");
    });

    it("answers a second apply with 409 while a run is active, and still reports checks", async () => {
      blockPullsUntilOpened();
      await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: TARGET_VERSION },
      });

      const second = await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: TARGET_VERSION },
      });
      const check = await app.inject({ method: "POST", url: "/check", headers: authorized() });

      expect(second.statusCode).toBe(409);
      expect(second.json()).toEqual({ error: "update_already_running" });
      expect(check.statusCode).toBe(200);

      openGate();
      await waitUntil(async () => (await readStatusOutcome()) === "succeeded");
      await waitUntil(async () => {
        const third = await app.inject({
          method: "POST",
          url: "/apply",
          headers: authorized(),
          payload: { version: TARGET_VERSION },
        });
        return third.statusCode === 202;
      });
      await waitUntil(async () => (await readStatusOutcome()) === "succeeded");
    });

    it("releases the lock after a failed run so that the next apply is accepted", async () => {
      failingPull = true;
      app = buildApp();

      await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: TARGET_VERSION },
      });
      await waitUntil(async () => (await readStatusOutcome()) === "failed_before_change");

      await waitUntil(async () => {
        const retry = await app.inject({
          method: "POST",
          url: "/apply",
          headers: authorized(),
          payload: { version: TARGET_VERSION },
        });
        return retry.statusCode === 202;
      });
    });

    it("answers an invalid body with 400", async () => {
      const wrongShape = await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: "v1.2.4" },
      });
      const extraField = await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: TARGET_VERSION, image: "anything" },
      });

      expect(wrongShape.statusCode).toBe(400);
      expect(wrongShape.json()).toEqual({ error: "invalid_request" });
      expect(extraField.statusCode).toBe(400);
    });

    it("answers 502 and frees the lock when the release source cannot be read", async () => {
      releaseLockOwner = createRunLock();
      const statusFile = join(directory, "status.json");
      app = buildUpdaterWithFetch(statusFile, async () => {
        throw new Error("offline");
      });

      const response = await app.inject({
        method: "POST",
        url: "/apply",
        headers: authorized(),
        payload: { version: TARGET_VERSION },
      });

      expect(response.statusCode).toBe(502);
      expect(response.json()).toEqual({ error: "release_source_unreachable" });
      expect(releaseLockOwner.tryAcquire()).not.toBeNull();
    });
  });

  const buildUpdaterWithFetch = (statusFile: string, httpFetch: HttpFetch): FastifyInstance =>
    buildUpdaterApp({
      apiToken: TOKEN,
      statusFile,
      releaseRepository: "owner/offgrid",
      runLock: releaseLockOwner,
      httpFetch,
      logger: createLogger({ level: "debug", sink: (line) => logLines.push(line) }),
      currentVersion: async () => CURRENT_VERSION,
      runApply: async () => {
        throw new Error("not used");
      },
    });
});
