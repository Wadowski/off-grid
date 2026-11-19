#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASE_COMPOSE = "infra/compose/docker-compose.yml";
const E2E_COMPOSE = "infra/compose/docker-compose.e2e.yml";
const EGRESS_COMPOSE = "infra/compose/docker-compose.egress-blocked.yml";
const PRODUCTION_COMPOSE = "infra/compose/docker-compose.production.yml";
const CONFIGURATIONS = [
  [BASE_COMPOSE],
  [BASE_COMPOSE, E2E_COMPOSE],
  [BASE_COMPOSE, EGRESS_COMPOSE],
  [PRODUCTION_COMPOSE],
];
const PLACEHOLDER_VERSION = "0.0.0";
const UPDATER = "updater";
const DOCKER_SOCKET = "/var/run/docker.sock";

const mountsDockerSocket = (service) =>
  (service.volumes ?? []).some(
    (volume) =>
      volume.target === DOCKER_SOCKET || String(volume.source ?? "").endsWith("docker.sock"),
  );

export const findViolations = (config) => {
  const services = config.services ?? {};
  const updater = services[UPDATER];
  if (updater === undefined) {
    return [`${UPDATER} service is missing`];
  }
  const violations = [];
  if (updater.ports !== undefined) {
    violations.push(`${UPDATER} publishes ports`);
  }
  if (!mountsDockerSocket(updater)) {
    violations.push(`${UPDATER} does not mount the Docker socket`);
  }
  for (const [name, service] of Object.entries(services)) {
    if (name !== UPDATER && mountsDockerSocket(service)) {
      violations.push(`${name} mounts the Docker socket`);
    }
  }
  return violations;
};

const composeConfigOf = (files) =>
  JSON.parse(
    execFileSync(
      "docker",
      ["compose", ...files.flatMap((file) => ["-f", file]), "config", "--format", "json"],
      {
        cwd: ROOT,
        encoding: "utf8",
        env: {
          ...process.env,
          OFFGRID_VERSION: process.env.OFFGRID_VERSION || PLACEHOLDER_VERSION,
        },
      },
    ),
  );

const main = () => {
  const failures = CONFIGURATIONS.flatMap((files) =>
    findViolations(composeConfigOf(files)).map((violation) => `${files.join(" + ")}: ${violation}`),
  );
  if (failures.length === 0) {
    console.log(
      "check:compose: updater publishes no ports and only the updater mounts the Docker socket",
    );
    return 0;
  }
  for (const failure of failures) {
    console.error(failure);
  }
  return 1;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = main();
}
