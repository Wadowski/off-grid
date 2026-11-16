// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class EventWithoutOwnerError extends Error {
  constructor() {
    super("A calendar event change has neither a family nor a user owner.");
    this.name = "EventWithoutOwnerError";
  }
}
