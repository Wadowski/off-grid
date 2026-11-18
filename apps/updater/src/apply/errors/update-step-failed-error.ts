// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStepName } from "../../types.js";

export class UpdateStepFailedError extends Error {
  constructor(
    readonly step: UpdateStepName,
    options?: ErrorOptions,
  ) {
    super(`update step ${step} failed`, options);
    this.name = "UpdateStepFailedError";
  }
}
