// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MultiSelect } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { calendarMultiSelectDotStyle } from "./styles.js";
import type { CalendarMultiSelectProps } from "./types.js";

export const CalendarMultiSelect = ({ calendars, hidden, onChange }: CalendarMultiSelectProps) => {
  const { t } = useTranslation();
  const selectedCount = calendars.filter((calendar) => !hidden.has(calendar.id)).length;
  const summary =
    hidden.size === 0
      ? t("calendar.mobileViews.allCalendars")
      : selectedCount === 0
        ? t("calendar.mobileViews.noCalendarsSelected")
        : t("calendar.mobileViews.calendarsSelected", {
            selected: selectedCount,
            total: calendars.length,
          });
  const selected = new Set(
    calendars.filter((calendar) => !hidden.has(calendar.id)).map((calendar) => calendar.id),
  );

  return (
    <MultiSelect
      testId="calendar-filter"
      groupLabel={t("calendar.mobileViews.calendarFilter")}
      triggerLabel={t("calendar.mobileViews.calendarFilterSummary", { summary })}
      summary={summary}
      options={calendars.map((calendar) => ({
        value: calendar.id,
        label: calendar.name,
        adornment: (
          <span
            style={calendarMultiSelectDotStyle(calendarAccentColor(calendar.color).background)}
          />
        ),
      }))}
      selected={selected}
      onChange={(next) => {
        onChange(
          new Set(
            calendars.filter((calendar) => !next.has(calendar.id)).map((calendar) => calendar.id),
          ),
        );
      }}
    />
  );
};
