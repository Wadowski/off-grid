// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class StorageIoError extends Error {
  readonly code: string;

  constructor(code: string) {
    super("Storage input or output failed");
    this.name = "StorageIoError";
    this.code = code;
  }
}
