// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, describe, expect, it } from "vitest";
import type { FakeEngine, FakeEngineImage, FakeEngineOptions } from "../../test/types.js";
import { startFakeDockerEngine } from "../../test/fake-docker-engine.js";
import { createDockerRunner } from "./create-docker-runner.js";

const OLD_SERVER_DIGEST = `ghcr.io/owner/offgrid-main-server@sha256:${"a".repeat(64)}`;
const OLD_WEB_DIGEST = `ghcr.io/owner/offgrid-main-web@sha256:${"b".repeat(64)}`;
const NEW_SERVER_DIGEST = `ghcr.io/owner/offgrid-main-server@sha256:${"c".repeat(64)}`;
const NEW_WEB_DIGEST = `ghcr.io/owner/offgrid-main-web@sha256:${"d".repeat(64)}`;

const oldServerImage = (repoDigests: string[] = [OLD_SERVER_DIGEST]): FakeEngineImage => ({
  reference: "offgrid-main-server:local",
  id: "sha256:old-server",
  repoDigests,
  env: ["NODE_ENV=production", "OFFGRID_VERSION=1.0.0"],
});

const oldWebImage: FakeEngineImage = {
  reference: "offgrid-main-web:local",
  id: "sha256:old-web",
  repoDigests: [OLD_WEB_DIGEST],
  env: ["OFFGRID_VERSION=1.0.0"],
};

const seed = (overrides: Partial<FakeEngineOptions> = {}): FakeEngineOptions => ({
  images: [oldServerImage(), oldWebImage],
  containers: [
    {
      name: "offgrid-server-1",
      service: "server",
      image: "offgrid-main-server:local",
      env: ["NODE_ENV=production", "OFFGRID_VERSION=1.0.0", "OFFGRID_HTTP_PORT=3000"],
      running: true,
      exitCode: 0,
    },
    {
      name: "offgrid-web-1",
      service: "web",
      image: "offgrid-main-web:local",
      env: ["OFFGRID_VERSION=1.0.0", "OFFGRID_WEB_PORT=8080"],
      running: true,
      exitCode: 0,
    },
    {
      name: "offgrid-init-1",
      service: "init",
      image: "offgrid-main-server:local",
      env: ["NODE_ENV=production", "OFFGRID_VERSION=1.0.0", "OFFGRID_DATABASE_HOST=db"],
      running: false,
      exitCode: 0,
    },
  ],
  ...overrides,
});

describe("createDockerRunner", () => {
  let engine: FakeEngine | undefined;

  const startWith = async (options: FakeEngineOptions) => {
    engine = await startFakeDockerEngine(options);
    return createDockerRunner({ socketPath: engine.socketPath, project: "offgrid" });
  };

  const pulledNewImages = async (runner: ReturnType<typeof createDockerRunner>) => {
    await runner.pullImage(NEW_SERVER_DIGEST);
    await runner.pullImage(NEW_WEB_DIGEST);
  };

  afterEach(async () => {
    await engine?.close();
    engine = undefined;
  });

  describe("inspectRunningImages", () => {
    it("returns the registry digests of the running server and web images", async () => {
      const runner = await startWith(seed());

      await expect(runner.inspectRunningImages()).resolves.toEqual({
        server: OLD_SERVER_DIGEST,
        web: OLD_WEB_DIGEST,
      });
    });

    it("fails when the running server image was not pulled from a registry", async () => {
      const runner = await startWith(seed({ images: [oldServerImage([]), oldWebImage] }));

      await expect(runner.inspectRunningImages()).rejects.toThrow(
        "server image has no registry digest",
      );
    });
  });

  describe("pullImage", () => {
    it("pulls the reference by digest so that it can be used afterwards", async () => {
      const runner = await startWith(seed());

      await runner.pullImage(NEW_SERVER_DIGEST);

      expect(engine?.requests.some((request) => request.path.startsWith("/images/create?"))).toBe(
        true,
      );
    });

    it("maps a pull error to a Docker error that does not echo the registry text", async () => {
      const runner = await startWith(seed({ pullFails: true }));

      const failure = runner.pullImage(NEW_SERVER_DIGEST);

      await expect(failure).rejects.toThrow("docker pull image failed with status 200");
      await expect(failure).rejects.not.toThrow("secret text");
    });
  });

  describe("replaceContainers and startContainers", () => {
    it("replaces both containers with the new images and keeps the previous ones stopped", async () => {
      const runner = await startWith(seed());
      await pulledNewImages(runner);

      await runner.replaceContainers({ server: NEW_SERVER_DIGEST, web: NEW_WEB_DIGEST });

      expect(engine?.containerNamed("offgrid-server-1")).toMatchObject({
        image: NEW_SERVER_DIGEST,
        running: true,
        env: ["OFFGRID_HTTP_PORT=3000"],
      });
      expect(engine?.containerNamed("offgrid-web-1")).toMatchObject({
        image: NEW_WEB_DIGEST,
        running: true,
      });
      expect(engine?.containerNamed("offgrid-server-1-replaced")).toMatchObject({
        image: "offgrid-main-server:local",
        running: false,
      });
    });

    it("restores the previous containers when they are started again", async () => {
      const runner = await startWith(seed());
      await pulledNewImages(runner);
      await runner.replaceContainers({ server: NEW_SERVER_DIGEST, web: NEW_WEB_DIGEST });
      await runner.stopContainers();

      await runner.startContainers({ server: OLD_SERVER_DIGEST, web: OLD_WEB_DIGEST });

      expect(engine?.containerNamed("offgrid-server-1")).toMatchObject({
        image: "offgrid-main-server:local",
        running: true,
      });
      expect(engine?.containerNamed("offgrid-server-1-replaced")).toBeUndefined();
      expect(engine?.containerNames().sort()).toEqual(
        ["offgrid-init-1", "offgrid-server-1", "offgrid-web-1"].sort(),
      );
    });

    it("stops both running containers", async () => {
      const runner = await startWith(seed());

      await runner.stopContainers();

      expect(engine?.containerNamed("offgrid-server-1")?.running).toBe(false);
      expect(engine?.containerNamed("offgrid-web-1")?.running).toBe(false);
    });
  });

  describe("runInitJob", () => {
    it("runs the init job with the new server image and removes it afterwards", async () => {
      const runner = await startWith(seed());
      await pulledNewImages(runner);

      await runner.runInitJob(NEW_SERVER_DIGEST);

      const create = engine?.requests.find((request) =>
        request.path.startsWith("/containers/create"),
      );
      expect(create?.body).toMatchObject({ Image: NEW_SERVER_DIGEST });
      expect(engine?.containerNames()).not.toContain("offgrid-init-update");
    });

    it("fails when the init job exits with an error", async () => {
      const runner = await startWith(seed({ initExitCode: 1 }));
      await pulledNewImages(runner);

      await expect(runner.runInitJob(NEW_SERVER_DIGEST)).rejects.toThrow(
        "init job exited with a failure",
      );
    });
  });
});
