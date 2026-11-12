// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { FilterChip } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { ALL_CALENDARS } from "../../../../calendar-views/events-by-calendar.js";
import { calendarAccentColor } from "../../../../calendars/calendar-accents.js";
import { calendarFilterBarStyle } from "./styles.js";
import type { CalendarFilterBarProps } from "./types.js";

export const CalendarFilterBar = ({ calendars, selected, onSelect }: CalendarFilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("calendar.mobileViews.calendarFilter")}
      style={calendarFilterBarStyle}
    >
      <FilterChip
        label={t("calendar.mobileViews.allCalendars")}
        selected={selected === ALL_CALENDARS}
        onToggle={() => onSelect(ALL_CALENDARS)}
        data-testid="calendar-filter-all"
      />
      {calendars.map((calendar) => (
        <FilterChip
          key={calendar.id}
          label={calendar.name}
          selected={selected === calendar.id}
          onToggle={() => onSelect(calendar.id)}
          dotColor={calendarAccentColor(calendar.color).background}
          data-testid={`calendar-filter-${calendar.id}`}
        />
      ))}
    </div>
  );
};
