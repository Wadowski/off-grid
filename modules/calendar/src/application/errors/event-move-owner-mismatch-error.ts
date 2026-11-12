// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class EventMoveOwnerMismatchError extends Error {
  constructor() {
    super("an event can only move to a calendar with the same owner");
    this.name = "EventMoveOwnerMismatchError";
  }
}
