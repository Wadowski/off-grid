// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class NameTakenError extends Error {
  constructor() {
    super("A live entry with this name already exists in the folder");
    this.name = "NameTakenError";
  }
}
