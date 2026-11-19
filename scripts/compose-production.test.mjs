// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { findViolations } from "./check-compose-no-published-ports.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTION = "infra/compose/docker-compose.production.yml";
const DEV = "infra/compose/docker-compose.yml";
const VERSION = "1.2.3";
const NAMED_VOLUMES = [
  "offgrid-db",
  "offgrid-secrets",
  "offgrid-files",
  "offgrid-backups",
  "offgrid-updater-state",
];
const SOCKET = "/var/run/docker.sock";
const IMAGE_SERVICES = ["server", "init", "web", "updater"];
const SECRET_NAME = /(PASSWORD|SECRET|TOKEN|KEY)$/;

const hostEnvironmentWithoutOffgrid = () =>
  Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("OFFGRID_")));

const renderConfig = (file, environment) =>
  spawnSync("docker", ["compose", "-f", join(ROOT, file), "config", "--format", "json"], {
    encoding: "utf8",
    env: environment,
    cwd: ROOT,
  });

const productionConfig = () => {
  const result = renderConfig(PRODUCTION, {
    ...hostEnvironmentWithoutOffgrid(),
    OFFGRID_VERSION: VERSION,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};

const devConfig = () => {
  const result = renderConfig(DEV, hostEnvironmentWithoutOffgrid());
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
};

const isSocketBind = (volume) => volume.type === "bind" && volume.target === SOCKET;

describe("production compose file", () => {
  it("fails fast when OFFGRID_VERSION is unset", () => {
    const result = renderConfig(PRODUCTION, hostEnvironmentWithoutOffgrid());

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /OFFGRID_VERSION/);
  });

  it("renders with OFFGRID_VERSION set", () => {
    assert.equal(typeof productionConfig().services, "object");
  });

  it("has the services of the dev file, without any build key", () => {
    const config = productionConfig();

    assert.deepEqual(Object.keys(config.services).sort(), [
      "db",
      "db-ownership",
      "init",
      "secrets-init",
      "server",
      "updater",
      "web",
    ]);
    for (const service of Object.values(config.services)) {
      assert.equal(service.build, undefined);
    }
  });

  it("pins every image to the version and never uses latest", () => {
    const { services } = productionConfig();

    for (const name of IMAGE_SERVICES) {
      assert.match(
        services[name].image,
        new RegExp(`^ghcr\\.io/wadowski/offgrid-[a-z-]+:${VERSION}$`),
      );
    }
    for (const service of Object.values(services)) {
      assert.doesNotMatch(service.image ?? "", /:latest$/);
    }
  });

  it("mounts only named volumes plus the Docker socket on the updater", () => {
    const { services } = productionConfig();

    for (const [name, service] of Object.entries(services)) {
      for (const volume of service.volumes ?? []) {
        if (name === "updater" && isSocketBind(volume)) {
          continue;
        }
        assert.equal(
          volume.type,
          "volume",
          `${name} mounts a ${volume.type} from ${volume.source}`,
        );
        assert.ok(NAMED_VOLUMES.includes(volume.source), `${name} mounts ${volume.source}`);
      }
    }
  });

  it("uses no bind source under data/, a relative path or the repo", () => {
    const { services, configs = {} } = productionConfig();
    const sources = Object.values(services).flatMap((service) =>
      (service.volumes ?? []).map((volume) => String(volume.source ?? "")),
    );
    const configSources = Object.values(services).flatMap((service) =>
      (service.configs ?? []).map((config) => config.source),
    );

    for (const source of sources) {
      assert.doesNotMatch(source, /data\/|\.\/|\.\.\//);
    }
    for (const source of configSources) {
      assert.ok(source in configs, `config ${source} is not defined`);
    }
  });

  it("declares exactly the five named volumes at the top level", () => {
    assert.deepEqual(Object.keys(productionConfig().volumes).sort(), [...NAMED_VOLUMES].sort());
  });

  it("publishes no port on the updater and only the updater holds the Docker socket", () => {
    assert.deepEqual(findViolations(productionConfig()), []);
  });

  it("keeps the health checks and depends_on conditions of the dev file", () => {
    const production = productionConfig().services;
    const dev = devConfig().services;

    for (const name of ["server", "db", "init"]) {
      assert.deepEqual(production[name].healthcheck, dev[name].healthcheck, `${name} healthcheck`);
      assert.deepEqual(production[name].depends_on, dev[name].depends_on, `${name} depends_on`);
    }
  });

  it("keeps secret values out of the environment, which only names _FILE paths", () => {
    const { services } = productionConfig();

    for (const [name, service] of Object.entries(services)) {
      for (const [key, value] of Object.entries(service.environment ?? {})) {
        if (SECRET_NAME.test(key) && !key.endsWith("_FILE")) {
          assert.equal(value, undefined, `${name} sets ${key} inline`);
        }
      }
    }
  });

  it("references the inlined init SQL and secrets script, not repo files", () => {
    const { services, configs } = productionConfig();

    assert.ok(Object.keys(configs).length >= 5);
    for (const config of Object.values(configs)) {
      assert.equal(typeof config.content, "string");
    }
    assert.ok(services.db.configs.length >= 4);
    assert.equal(services["secrets-init"].configs[0].source, "secrets-init.sh");
  });

  it("mounts the Docker socket on the updater with the default group", () => {
    const { services } = productionConfig();

    assert.deepEqual(services.updater.group_add, ["0"]);
    assert.ok(
      services.updater.volumes.some(
        (volume) => volume.target === SOCKET && volume.source === SOCKET,
      ),
    );
  });
});
