// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class StatusFileCorruptError extends Error {
  constructor(options?: ErrorOptions) {
    super("update status file is not valid JSON", options);
    this.name = "StatusFileCorruptError";
  }
}
