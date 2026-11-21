// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class UploadTooLargeError extends Error {
  constructor() {
    super("An upload is larger than the configured limit");
    this.name = "UploadTooLargeError";
  }
}
