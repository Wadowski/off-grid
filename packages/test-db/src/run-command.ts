// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawn } from "node:child_process";
import { exitCodeOf } from "./exit-code-of.js";
import { forwardSignals } from "./forward-signals.js";

export const runCommand = (
  command: string,
  args: readonly string[],
  environment: NodeJS.ProcessEnv,
): Promise<number> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", env: environment });
    const stopForwarding = forwardSignals(child);
    child.once("error", (error) => {
      stopForwarding();
      reject(error);
    });
    child.once("exit", (code, signal) => {
      stopForwarding();
      resolve(exitCodeOf(code, signal));
    });
  });
