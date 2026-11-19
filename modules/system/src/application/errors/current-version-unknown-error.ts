// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class CurrentVersionUnknownError extends Error {
  constructor() {
    super("The running version is not a release");
    this.name = "CurrentVersionUnknownError";
  }
}
