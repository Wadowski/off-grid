// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class RestoreFailedError extends Error {
  constructor(
    readonly step: string,
    options?: ErrorOptions,
  ) {
    super(`restore failed at step ${step}`, options);
    this.name = "RestoreFailedError";
  }
}
