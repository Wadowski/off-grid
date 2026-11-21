// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFile } from "node:child_process";

const MAX_BUFFER_BYTES = 64 * 1024 * 1024;

export const runDocker = (args: readonly string[], input?: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const child = execFile(
      "docker",
      [...args],
      { maxBuffer: MAX_BUFFER_BYTES },
      (error, stdout, stderr) =>
        error === null ? resolve(stdout) : reject(new Error(`docker ${args[0]} failed: ${stderr}`)),
    );
    child.stdin?.end(input);
  });
