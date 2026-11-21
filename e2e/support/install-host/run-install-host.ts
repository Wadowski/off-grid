// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawn } from "node:child_process";
import type { InstallRunResult } from "./types.js";

export const runInstallHost = (containerName: string): Promise<InstallRunResult> =>
  new Promise((resolve, reject) => {
    const child = spawn("docker", ["start", "--attach", containerName]);
    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.on("error", reject);
    child.on("close", (exitCode) =>
      resolve({ exitCode: exitCode ?? 1, output: Buffer.concat(chunks).toString("utf8") }),
    );
  });
