// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStepName } from "../../types.js";

export class PreviousImagesMissingError extends Error {
  constructor(readonly step: UpdateStepName) {
    super(`update step ${step} has no previous images to start`);
    this.name = "PreviousImagesMissingError";
  }
}
