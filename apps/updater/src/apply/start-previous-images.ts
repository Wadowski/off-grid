// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";

export const startPreviousImages = async (run: UpdateRun): Promise<void> => {
  const { previousImages } = run.status;
  if (previousImages === null) {
    throw new Error("previous images were not captured in this run");
  }
  await run.dependencies.docker.startContainers(previousImages);
};
