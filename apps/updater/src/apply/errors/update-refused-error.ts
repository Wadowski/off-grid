// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class UpdateRefusedError extends Error {
  constructor(readonly reason: string) {
    super(`update refused: ${reason}`);
    this.name = "UpdateRefusedError";
  }
}
