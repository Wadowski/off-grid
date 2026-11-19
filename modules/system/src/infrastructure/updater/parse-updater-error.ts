// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { CurrentVersionUnknownError } from "../../application/errors/current-version-unknown-error.js";
import { UpdateAlreadyRunningError } from "../../application/errors/update-already-running-error.js";
import { UpdaterFailedError } from "../../application/errors/updater-failed-error.js";
import { updaterErrorBodySchema } from "./updater-reply-schemas.js";

export const parseUpdaterError = (status: number, payload: unknown): Error => {
  const body = updaterErrorBodySchema.safeParse(payload);
  const code = body.success ? body.data.error : null;
  if (status === 409 && code === "update_already_running") {
    return new UpdateAlreadyRunningError();
  }
  if (status === 503 && code === "current_version_unknown") {
    return new CurrentVersionUnknownError();
  }
  if (status === 502 && code === "release_source_unreachable") {
    return new UpdaterFailedError("RELEASE_SOURCE_UNREACHABLE");
  }
  return new UpdaterFailedError("UPDATER_ERROR");
};
