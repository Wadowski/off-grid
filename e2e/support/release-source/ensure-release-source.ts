// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { prepareReleaseSource } from "./prepare-release-source.js";
import { registryPort } from "./registry-port.js";
import { releaseSourceDirectory } from "./release-source-directory.js";

let preparation: Promise<void> | undefined;

export const ensureReleaseSource = (): Promise<void> => {
  preparation ??= prepareReleaseSource({
    directory: releaseSourceDirectory(),
    registryPort: registryPort(),
  });
  return preparation;
};
