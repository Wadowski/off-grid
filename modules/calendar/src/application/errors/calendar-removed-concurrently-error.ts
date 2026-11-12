// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export class CalendarRemovedConcurrentlyError extends Error {
  constructor() {
    super("calendar was removed by another request while its events were deleted");
    this.name = "CalendarRemovedConcurrentlyError";
  }
}
