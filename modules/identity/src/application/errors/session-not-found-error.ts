// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class SessionNotFoundError extends Error {
  constructor() {
    super("No live session matches the request");
    this.name = "SessionNotFoundError";
  }
}
