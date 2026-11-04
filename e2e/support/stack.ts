// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { eventually } from "./eventually.js";

const execFileAsync = promisify(execFile);

const COMPOSE_E2E_OVERRIDE_FILE = fileURLToPath(
  new URL("../../infra/compose/docker-compose.e2e.yml", import.meta.url),
);
const COMPOSE_FILE = fileURLToPath(
  new URL("../../infra/compose/docker-compose.yml", import.meta.url),
);

const STACK_SERVICES = ["server", "mail", "web"] as const;

const READY_PATH = "/api/health/ready";
const READY_TIMEOUT_MS = 180_000;
const READY_INTERVAL_MS = 500;

export function newComposeProjectName(): string {
  return `offgrid-e2e-${randomBytes(4).toString("hex")}`;
}

function composeArgs(project: string, args: readonly string[]): string[] {
  return ["compose", "-p", project, "-f", COMPOSE_FILE, "-f", COMPOSE_E2E_OVERRIDE_FILE, ...args];
}

export function serverPort(): string {
  return process.env.E2E_SERVER_PORT ?? "3000";
}

export function webPort(): string {
  return process.env.E2E_WEB_PORT ?? "5173";
}

export function targetBaseUrl(): string {
  return process.env.BASE_URL ?? `http://127.0.0.1:${serverPort()}`;
}

export function webBaseUrl(): string {
  return `http://127.0.0.1:${webPort()}`;
}

export async function compose(project: string, args: readonly string[]): Promise<string> {
  const { stdout } = await execFileAsync("docker", composeArgs(project, args), {
    env: {
      ...process.env,
      OFFGRID_SERVER_PORT: serverPort(),
      OFFGRID_WEB_PORT: webPort(),
      OFFGRID_API_ORIGIN: targetBaseUrl(),
    },
    maxBuffer: 64 * 1024 * 1024,
  });
  return stdout;
}

export async function bringUpStack(project: string): Promise<void> {
  await compose(project, ["up", "--detach", "--build", "--wait", ...STACK_SERVICES]);
}

export async function tearDownStack(project: string): Promise<void> {
  await compose(project, ["down", "--volumes", "--remove-orphans"]);
}

type WaitOptions = {
  timeoutMs?: number;
  intervalMs?: number;
  fetchImpl?: typeof fetch;
};

export async function waitForReady(
  baseUrl: string,
  {
    timeoutMs = READY_TIMEOUT_MS,
    intervalMs = READY_INTERVAL_MS,
    fetchImpl = fetch,
  }: WaitOptions = {},
): Promise<void> {
  const url = new URL(READY_PATH, baseUrl);
  try {
    await eventually(
      async () => {
        const response = await fetchImpl(url);
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
      },
      { timeout: timeoutMs, interval: intervalMs },
    );
  } catch (error) {
    const last = error instanceof Error ? error.message : "request failed";
    throw new Error(`Stack not ready at ${url.href} after ${timeoutMs} ms (last: ${last}).`, {
      cause: error,
    });
  }
}
