// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CERTIFICATE_SCRIPT,
  LATEST_VERSION_FILE,
  RELEASES_FOLDER,
  REQUEST_LOG_FILE,
} from "./constants.js";
import { releaseSourceDirectory } from "./release-source-directory.js";
import { releaseSourcePort } from "./release-source-port.js";
import { startFakeReleaseSource } from "./start-fake-release-source.js";
import type { FakeReleaseSource } from "./types.js";

export const startReleaseSource = (): Promise<FakeReleaseSource> => {
  const directory = releaseSourceDirectory();
  for (const stale of [RELEASES_FOLDER, LATEST_VERSION_FILE, REQUEST_LOG_FILE]) {
    rmSync(join(directory, stale), { recursive: true, force: true });
  }
  execFileSync("node", [fileURLToPath(new URL(CERTIFICATE_SCRIPT, import.meta.url)), directory]);
  return startFakeReleaseSource({
    directory,
    certificate: join(directory, "ca.pem"),
    key: join(directory, "server.key"),
    port: Number(releaseSourcePort()),
  });
};
