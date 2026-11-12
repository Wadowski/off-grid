// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:net";
import { dirname } from "node:path";
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

const RUN_PROJECT = /^offgrid-e2e-[0-9a-f]{8}$/;
const COMPOSE_WORKING_DIR = dirname(COMPOSE_FILE);

export function newComposeProjectName(): string {
  return `offgrid-e2e-${randomBytes(4).toString("hex")}`;
}

// Only the random names from newComposeProjectName, so a stack started by hand
// (for example offgrid-e2e-local) is never removed by a test run.
export function isRunProject(project: string): boolean {
  return RUN_PROJECT.test(project);
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

export type ContainerProject = { project: string; workingDir: string };

export function parseContainerProjects(output: string): ContainerProject[] {
  const projects = new Map<string, ContainerProject>();
  for (const line of output.split("\n")) {
    const [project, workingDir] = line.split("\t");
    if (project && workingDir && !projects.has(project)) {
      projects.set(project, { project, workingDir });
    }
  }
  return [...projects.values()];
}

async function listContainerProjects(filters: readonly string[]): Promise<ContainerProject[]> {
  const format =
    '{{.Label "com.docker.compose.project"}}\t{{.Label "com.docker.compose.project.working_dir"}}';
  const { stdout } = await execFileAsync("docker", ["ps", "--all", ...filters, "--format", format]);
  return parseContainerProjects(stdout);
}

// Removes run stacks left behind by an earlier run that was killed before its teardown,
// but only those started from this checkout.
export async function stopLeftoverRunStacks(): Promise<string[]> {
  const leftovers = (
    await listContainerProjects([
      "--filter",
      `label=com.docker.compose.project.working_dir=${COMPOSE_WORKING_DIR}`,
    ])
  )
    .map(({ project }) => project)
    .filter(isRunProject);
  for (const project of leftovers) {
    await tearDownStack(project);
  }
  return leftovers;
}

export type PortCheck = { name: string; port: string; envVar: string };

export function e2ePortChecks(): PortCheck[] {
  return [
    { name: "server", port: serverPort(), envVar: "E2E_SERVER_PORT" },
    { name: "web app", port: webPort(), envVar: "E2E_WEB_PORT" },
    {
      name: "mail UI",
      port: process.env.OFFGRID_MAIL_UI_PORT ?? "8025",
      envVar: "OFFGRID_MAIL_UI_PORT",
    },
  ];
}

export function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => resolve(false));
    probe.listen(port, "127.0.0.1", () => probe.close(() => resolve(true)));
  });
}

// Fails before a stack is started, naming the stack that holds the port, instead of
// letting docker compose fail half-way with "port is already allocated".
export async function assertPortsFree(checks: readonly PortCheck[]): Promise<void> {
  for (const { name, port, envVar } of checks) {
    if (await isPortFree(Number(port))) {
      continue;
    }
    const holders = await listContainerProjects(["--filter", `publish=${port}`]);
    const who = holders.length
      ? holders
          .map(({ project, workingDir }) => `${project} (started from ${workingDir})`)
          .join(", ")
      : "another process";
    throw new Error(
      `Port ${port} for the e2e ${name} is in use by ${who}. Stop that stack, or set ${envVar} to a free port.`,
    );
  }
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
