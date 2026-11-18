// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawn } from "node:child_process";
import { STDERR_TAIL_BYTES } from "../constants.js";

const REDACTED = "[redacted]";

export const runPostgresTool = (
  command: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ["ignore", "ignore", "pipe"] });
    let stderrTail = Buffer.alloc(0);
    child.stderr.on("data", (chunk: Buffer) => {
      stderrTail = Buffer.concat([stderrTail, chunk]).subarray(-STDERR_TAIL_BYTES);
    });
    child.on("error", () => reject(new Error(`${command} cannot be started`)));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const detail = redact(stderrTail.toString("utf8").trim(), env.PGPASSWORD);
      reject(new Error(`${command} exited with code ${code}${detail === "" ? "" : `\n${detail}`}`));
    });
  });

const redact = (text: string, password: string | undefined): string =>
  password === undefined || password === "" ? text : text.split(password).join(REDACTED);
