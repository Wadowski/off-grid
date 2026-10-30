// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { Reporter, TestCase, TestResult } from "@playwright/test/reporter";
import { compose } from "./stack.js";

const ARTIFACTS_DIR = fileURLToPath(new URL("../artifacts", import.meta.url));
const LOG_SERVICES = ["server", "db"] as const;

export default class FailureArtifactsReporter implements Reporter {
  private logsWritten = false;

  async onTestEnd(_test: TestCase, result: TestResult): Promise<void> {
    if (this.logsWritten || !isFailure(result)) {
      return;
    }
    this.logsWritten = true;
    await writeServiceLogs();
  }
}

function isFailure(result: TestResult): boolean {
  return result.status === "failed" || result.status === "timedOut";
}

async function writeServiceLogs(): Promise<void> {
  const project = process.env.E2E_COMPOSE_PROJECT;
  if (!project) {
    return;
  }
  const logs = await compose(project, [
    "logs",
    "--no-color",
    "--timestamps",
    ...LOG_SERVICES,
  ]).catch((error: unknown) => `could not collect service logs: ${messageOf(error)}\n`);
  await mkdir(ARTIFACTS_DIR, { recursive: true });
  await writeFile(`${ARTIFACTS_DIR}/service-logs.txt`, logs);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
