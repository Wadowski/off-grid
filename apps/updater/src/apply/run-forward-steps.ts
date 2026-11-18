// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { pullUpdateImages } from "./pull-update-images.js";
import { runUpdateStep } from "./run-update-step.js";
import { waitForBothHealthy } from "./wait-for-both-healthy.js";

export const runForwardSteps = async (run: UpdateRun): Promise<void> => {
  const { docker } = run.dependencies;
  const newImages = {
    server: run.manifest.images.server.reference,
    web: run.manifest.images.web.reference,
  };
  await runUpdateStep(run, "pull", () => pullUpdateImages(run));
  await runUpdateStep(run, "migrate", () => docker.runInitJob(newImages.server));
  await runUpdateStep(run, "replace", () => docker.replaceContainers(newImages));
  await runUpdateStep(run, "health", () => waitForBothHealthy(run.dependencies));
};
