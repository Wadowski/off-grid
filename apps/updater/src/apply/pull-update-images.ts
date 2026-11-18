// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { patchRunStatus } from "./patch-run-status.js";

export const pullUpdateImages = async (run: UpdateRun): Promise<void> => {
  const { docker } = run.dependencies;
  const previousImages = await docker.inspectRunningImages();
  await patchRunStatus(run, { previousImages });
  await docker.pullImage(run.manifest.images.server.reference);
  await docker.pullImage(run.manifest.images.web.reference);
};
