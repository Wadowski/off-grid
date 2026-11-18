// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class StorageKeyAllocationError extends Error {
  constructor() {
    super("No free storage key could be allocated");
    this.name = "StorageKeyAllocationError";
  }
}
