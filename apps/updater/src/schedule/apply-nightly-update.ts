// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { NightlyRunResult, ReleaseContext, UpdaterServices } from "../types.js";

export const applyNightlyUpdate = async (
  services: UpdaterServices,
  context: ReleaseContext,
): Promise<NightlyRunResult> => {
  try {
    const status = await services.runApply({
      currentVersion: context.currentVersion,
      manifest: context.manifest,
    });
    services.logger.info("nightly update finished", { outcome: status.outcome });
    return status.outcome === "succeeded" ? "applied" : "failed";
  } catch {
    services.logger.error("nightly update ended with an error");
    return "failed";
  }
};
