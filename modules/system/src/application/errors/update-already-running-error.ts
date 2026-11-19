// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class UpdateAlreadyRunningError extends Error {
  constructor() {
    super("An update is already running");
    this.name = "UpdateAlreadyRunningError";
  }
}
