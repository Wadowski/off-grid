// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class StorageRangeNotSatisfiableError extends Error {
  constructor() {
    super("The requested byte range is outside the stored object");
    this.name = "StorageRangeNotSatisfiableError";
  }
}
