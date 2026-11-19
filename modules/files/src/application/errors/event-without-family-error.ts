// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class EventWithoutFamilyError extends Error {
  constructor() {
    super("family-created event has no family id");
    this.name = "EventWithoutFamilyError";
  }
}
