// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { UpdateErrorCode } from "../../types.js";

export class UpdaterFailedError extends Error {
  readonly code: Extract<UpdateErrorCode, "UPDATER_ERROR" | "RELEASE_SOURCE_UNREACHABLE">;

  constructor(code: UpdaterFailedError["code"]) {
    super("The updater returned an error");
    this.name = "UpdaterFailedError";
    this.code = code;
  }
}
