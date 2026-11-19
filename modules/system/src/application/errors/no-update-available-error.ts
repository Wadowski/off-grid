// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class NoUpdateAvailableError extends Error {
  constructor() {
    super("No newer release is available");
    this.name = "NoUpdateAvailableError";
  }
}
