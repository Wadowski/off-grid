// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class UpdaterUnavailableError extends Error {
  constructor() {
    super("The updater is not reachable");
    this.name = "UpdaterUnavailableError";
  }
}
