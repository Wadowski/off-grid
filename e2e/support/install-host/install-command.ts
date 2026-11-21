// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { InstallHostKind } from "./types.js";

const COMMANDS: Record<InstallHostKind, string> = {
  "with-docker": "ln -sf /e2e/container/docker /usr/local/bin/docker && exec sh /e2e/install.sh",
  "without-docker": "PATH=/e2e/container/shims:$PATH exec sh /e2e/install.sh",
  "not-linux": "exec sh /e2e/install.sh",
};

export const installCommand = (kind: InstallHostKind): string => COMMANDS[kind];
