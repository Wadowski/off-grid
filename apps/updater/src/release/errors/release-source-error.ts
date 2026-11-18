// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class ReleaseSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReleaseSourceError";
  }
}
