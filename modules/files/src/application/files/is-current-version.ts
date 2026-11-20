// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CrossOwnerPlan } from "../../types.js";

export const isCurrentVersion = (plan: CrossOwnerPlan, versionId: string): boolean =>
  plan.tree.entries.some((entry) => entry.currentVersionId === versionId);
