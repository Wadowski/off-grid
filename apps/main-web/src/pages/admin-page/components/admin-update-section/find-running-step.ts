// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { SystemUpdate, UpdateStepName } from "./types.js";

export const findRunningStep = (update: SystemUpdate): UpdateStepName | null =>
  update.lastRun?.steps.find((step) => step.state === "running")?.name ?? null;
