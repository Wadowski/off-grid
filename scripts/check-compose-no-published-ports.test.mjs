// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { findViolations } from "./check-compose-no-published-ports.mjs";

const SCRIPT = fileURLToPath(new URL("./check-compose-no-published-ports.mjs", import.meta.url));

const socketVolume = {
  type: "bind",
  source: "/var/run/docker.sock",
  target: "/var/run/docker.sock",
};

const compliantConfig = () => ({
  services: {
    server: {
      volumes: [{ type: "volume", source: "data", target: "/data" }],
      ports: [{ target: 3000 }],
    },
    web: {},
    updater: { volumes: [socketVolume] },
  },
});

test("accepts a config where only the updater mounts the socket and publishes no ports", () => {
  assert.deepEqual(findViolations(compliantConfig()), []);
});

test("rejects a published port on the updater", () => {
  const config = compliantConfig();
  config.services.updater.ports = [{ target: 3100, published: "3100" }];

  assert.deepEqual(findViolations(config), ["updater publishes ports"]);
});

test("rejects the Docker socket mounted into another service", () => {
  const config = compliantConfig();
  config.services.server.volumes.push(socketVolume);

  assert.deepEqual(findViolations(config), ["server mounts the Docker socket"]);
});

test("rejects an updater without the Docker socket", () => {
  const config = compliantConfig();
  config.services.updater.volumes = [];

  assert.deepEqual(findViolations(config), ["updater does not mount the Docker socket"]);
});

test("rejects a config without an updater service", () => {
  const config = compliantConfig();
  delete config.services.updater;

  assert.deepEqual(findViolations(config), ["updater service is missing"]);
});

test("passes on the repository compose files", () => {
  const output = execFileSync(process.execPath, [SCRIPT], { encoding: "utf8" });

  assert.match(output, /check:compose/);
});
