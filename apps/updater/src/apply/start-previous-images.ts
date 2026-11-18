// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateRun } from "../types.js";
import { PreviousImagesMissingError } from "./errors/previous-images-missing-error.js";

export const startPreviousImages = async (run: UpdateRun): Promise<void> => {
  const { previousImages } = run.status;
  if (previousImages === null) {
    throw new PreviousImagesMissingError("rollback_start");
  }
  await run.dependencies.docker.startContainers(previousImages);
};
