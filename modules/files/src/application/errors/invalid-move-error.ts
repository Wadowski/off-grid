// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class InvalidMoveError extends Error {
  constructor() {
    super("The entry cannot be moved to this folder");
    this.name = "InvalidMoveError";
  }
}
