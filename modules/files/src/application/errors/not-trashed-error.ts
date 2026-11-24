// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class NotTrashedError extends Error {
  constructor() {
    super("The entry is not in the trash");
    this.name = "NotTrashedError";
  }
}
