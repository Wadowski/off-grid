#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_COMPOSE_FILE = join(ROOT, "infra/compose/docker-compose.yml");
const EGRESS_COMPOSE_FILE = join(ROOT, "infra/compose/docker-compose.egress-blocked.yml");
const STACK_SERVICES = ["server", "web"];
const READY_URL = "http://127.0.0.1:3000/api/health/ready";
const EXTERNAL_URL = "http://1.1.1.1/";
const PROBE_TIMEOUT_MS = 5000;
const BLOCKED_ERROR_CODES = ["ENETUNREACH", "EHOSTUNREACH"];
const EXIT_BLOCKED = 0;
const EXIT_REACHABLE = 3;
const EXIT_INCONCLUSIVE = 4;
const READY_PROBE = `fetch("${READY_URL}").then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))`;
const EGRESS_PROBE = `fetch("${EXTERNAL_URL}", { signal: AbortSignal.timeout(${PROBE_TIMEOUT_MS}) }).then(() => process.exit(${EXIT_REACHABLE}), (error) => process.exit(${JSON.stringify(BLOCKED_ERROR_CODES)}.includes(error.cause?.code) ? ${EXIT_BLOCKED} : ${EXIT_INCONCLUSIVE}))`;

function compose(project, args) {
  return execFileAsync(
    "docker",
    ["compose", "-p", project, "-f", BASE_COMPOSE_FILE, "-f", EGRESS_COMPOSE_FILE, ...args],
    { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 },
  );
}

function serverNodeExec(project, script) {
  return compose(project, ["exec", "-T", "server", "node", "-e", script]);
}

async function assertReady(project) {
  await serverNodeExec(project, READY_PROBE).catch((error) => {
    throw new Error("the egress-blocked stack did not answer /api/health/ready", { cause: error });
  });
}

async function assertEgressBlocked(project) {
  await serverNodeExec(project, EGRESS_PROBE).catch((error) => {
    if (error.code === EXIT_REACHABLE) {
      throw new Error("the server reached an external address with egress blocked");
    }
    if (error.code === EXIT_INCONCLUSIVE) {
      throw new Error("the egress probe failed with an error that does not show a network block");
    }
    throw new Error("the egress probe could not run in the server container", { cause: error });
  });
}

async function checkStackEgress() {
  const project = `offgrid-egress-${randomBytes(4).toString("hex")}`;
  try {
    await compose(project, ["up", "--detach", "--wait", ...STACK_SERVICES]);
    await assertReady(project);
    await assertEgressBlocked(project);
    console.log(`check-stack-egress: ok (${project})`);
  } finally {
    await compose(project, ["down", "--volumes", "--remove-orphans"]).catch((error) => {
      console.error(`check-stack-egress: teardown failed: ${error.message}`);
      process.exitCode = 1;
    });
  }
}

checkStackEgress().catch((error) => {
  console.error(`check-stack-egress: ${error.message}`);
  process.exitCode = 1;
});
