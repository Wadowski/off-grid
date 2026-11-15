// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarEventStatus } from "../types.js";

export type EventDetailsStateProps = {
  readonly status: Exclude<CalendarEventStatus, "ready">;
  readonly retry: () => void;
};
