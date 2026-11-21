// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDocker } from "../release-source/run-docker.js";

export const readHostFile = async (containerName: string, path: string): Promise<string> => {
  const directory = await mkdtemp(join(tmpdir(), "install-host-"));
  try {
    const target = join(directory, "copy");
    await runDocker(["cp", `${containerName}:${path}`, target]);
    return await readFile(target, "utf8");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
};
