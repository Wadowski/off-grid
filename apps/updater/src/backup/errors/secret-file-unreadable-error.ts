// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class SecretFileUnreadableError extends Error {
  constructor(readonly fileName: string) {
    super(`secret file ${fileName} cannot be read`);
    this.name = "SecretFileUnreadableError";
  }
}
