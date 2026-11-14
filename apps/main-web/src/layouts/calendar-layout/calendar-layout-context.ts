// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useOutletContext } from "react-router-dom";
import type { CalendarLayoutContext } from "../../types.js";

const isCalendarLayoutContext = (value: unknown): value is CalendarLayoutContext =>
  typeof value === "object" &&
  value !== null &&
  "calendars" in value &&
  "hidden" in value &&
  "setHidden" in value;

export const useCalendarLayout = (): CalendarLayoutContext => {
  const context: unknown = useOutletContext();
  if (!isCalendarLayoutContext(context)) {
    throw new Error("useCalendarLayout must be used inside CalendarLayout.");
  }
  return context;
};
