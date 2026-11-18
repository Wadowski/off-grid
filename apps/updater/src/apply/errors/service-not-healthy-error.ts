// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStepName } from "../../types.js";

export class ServiceNotHealthyError extends Error {
  constructor(readonly step: UpdateStepName) {
    super(`update step ${step} found a service not healthy in time`);
    this.name = "ServiceNotHealthyError";
  }
}
