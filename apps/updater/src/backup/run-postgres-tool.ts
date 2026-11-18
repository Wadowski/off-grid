// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawn } from "node:child_process";

export const runPostgresTool = (
  command: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio: ["ignore", "ignore", "ignore"] });
    child.on("error", () => reject(new Error(`${command} cannot be started`)));
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)),
    );
  });
