// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { randomUUID } from "node:crypto";
import type { ApplyDependencies, ParsedApplyRequest, UpdateRun } from "../types.js";
import { createInitialStatus } from "./create-initial-status.js";
import { currentTimestamp } from "./current-timestamp.js";

export const startUpdateRun = async (
  dependencies: ApplyDependencies,
  request: ParsedApplyRequest,
): Promise<UpdateRun> => {
  const status = createInitialStatus(
    randomUUID(),
    request.currentVersion,
    request.manifest.version,
    currentTimestamp(dependencies.clock),
  );
  await dependencies.statusStore.write(status);
  return { dependencies, manifest: request.manifest, status };
};
