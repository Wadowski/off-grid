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
const READY_PROBE = `fetch("http://127.0.0.1:3000/api/health/ready").then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))`;
const EGRESS_PROBE = `fetch("http://1.1.1.1/", { signal: AbortSignal.timeout(5000) }).then(() => process.exit(1), () => process.exit(0))`;

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
  await serverNodeExec(project, READY_PROBE).catch(() => {
    throw new Error("the egress-blocked stack did not answer /api/health/ready");
  });
}

async function assertEgressBlocked(project) {
  await serverNodeExec(project, EGRESS_PROBE).catch(() => {
    throw new Error("the server reached an external address with egress blocked");
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
    });
  }
}

checkStackEgress().catch((error) => {
  console.error(`check-stack-egress: ${error.message}`);
  process.exitCode = 1;
});
