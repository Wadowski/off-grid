// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useTranslation } from "react-i18next";
import {
  ALL_CALENDARS,
  type CalendarFilter,
} from "../../../../calendar-views/events-by-calendar.js";
import { calendarFilterSelectStyle } from "./styles.js";
import type { CalendarFilterSelectProps } from "./types.js";

export const CalendarFilterSelect = ({
  calendars,
  selected,
  onSelect,
}: CalendarFilterSelectProps) => {
  const { t } = useTranslation();

  return (
    <select
      aria-label={t("calendar.mobileViews.calendarFilter")}
      data-testid="calendar-filter-select"
      className="og-focusable"
      style={calendarFilterSelectStyle}
      value={selected}
      onChange={(event) => onSelect(event.target.value as CalendarFilter)}
    >
      <option value={ALL_CALENDARS}>{t("calendar.mobileViews.allCalendars")}</option>
      {calendars.map((calendar) => (
        <option key={calendar.id} value={calendar.id}>
          {calendar.name}
        </option>
      ))}
    </select>
  );
};
