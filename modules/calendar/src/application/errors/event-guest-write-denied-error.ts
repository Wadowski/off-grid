// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class EventGuestWriteDeniedError extends Error {
  constructor() {
    super("a guest of an event may not change it");
    this.name = "EventGuestWriteDeniedError";
  }
}
