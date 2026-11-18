// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateStep, UpdateStepName, UpdateStepState } from "../types.js";

export const upsertStepState = (
  steps: readonly UpdateStep[],
  name: UpdateStepName,
  state: UpdateStepState,
  timestamp: string,
): UpdateStep[] => {
  const existing = steps.find((step) => step.name === name);
  const nextStep: UpdateStep = {
    name,
    state,
    startedAt: state === "running" ? timestamp : (existing?.startedAt ?? null),
    finishedAt: state === "running" || state === "pending" ? null : timestamp,
  };
  if (existing === undefined) {
    return [...steps, nextStep];
  }
  return steps.map((step) => (step.name === name ? nextStep : step));
};
