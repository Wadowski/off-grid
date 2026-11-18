// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class StorageObjectNotFoundError extends Error {
  constructor() {
    super("No stored object matches the key");
    this.name = "StorageObjectNotFoundError";
  }
}
