// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class StorageKeyInvalidError extends Error {
  constructor() {
    super("Storage key is not valid");
    this.name = "StorageKeyInvalidError";
  }
}
