// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class EventGuestInviteRefusedError extends Error {
  constructor() {
    super("this person cannot be invited to the event");
    this.name = "EventGuestInviteRefusedError";
  }
}
