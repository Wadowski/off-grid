// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatDayHeading } from "../../../../../../calendar-views/time-format.js";
import { weekDayNumber } from "../../../../../../calendar-views/week-days.js";
import { MonthEventChip } from "../month-event-chip/month-event-chip.js";
import {
  desktopMonthCellStyle,
  desktopMonthChipListStyle,
  desktopMonthDayHeaderStyle,
  desktopMonthDayNumberStyle,
  desktopMonthDotStyle,
  desktopMonthMoreTextStyle,
  desktopMonthTodayLabelStyle,
} from "../../styles.js";
import type { MonthDayCellDesktopProps } from "./types.js";

const MAX_CHIPS_PER_DAY = 2;

export const MonthDayCellDesktop = ({
  date,
  inMonth,
  events,
  selected,
  today,
  timeZone,
  onOpenDay,
}: MonthDayCellDesktopProps) => {
  const { t } = useTranslation();
  const visible = events.slice(0, MAX_CHIPS_PER_DAY);
  const hidden = events.length - visible.length;

  return (
    <div
      role="group"
      aria-label={formatDayHeading(date)}
      data-testid={`month-desktop-cell-${date}`}
      style={desktopMonthCellStyle(inMonth, today, selected)}
    >
      <div style={desktopMonthDayHeaderStyle}>
        {inMonth ? (
          <Button
            variant="ghost"
            size="small"
            align="start"
            aria-current={today ? "date" : undefined}
            data-selected={selected}
            data-testid={`month-desktop-day-${date}`}
            onClick={() => onOpenDay(date)}
          >
            <span style={desktopMonthDayNumberStyle(selected, today)}>
              {today && (
                <span aria-hidden="true" style={desktopMonthTodayLabelStyle}>
                  <Text variant="caption" textId="calendar.views.today" />
                </span>
              )}
              {weekDayNumber(date)}
            </span>
          </Button>
        ) : (
          <span style={desktopMonthDayNumberStyle(false, false)}>{weekDayNumber(date)}</span>
        )}
        {inMonth && events.length > 0 && <span aria-hidden="true" style={desktopMonthDotStyle} />}
      </div>
      {inMonth && (
        <div style={desktopMonthChipListStyle}>
          {visible.map((event) => (
            <MonthEventChip key={event.id} event={event} timeZone={timeZone} />
          ))}
          {hidden > 0 && (
            <Button
              variant="ghost"
              size="small"
              align="start"
              fullWidth
              onClick={() => onOpenDay(date)}
            >
              <span style={desktopMonthMoreTextStyle}>
                {t("calendar.desktop.moreEvents", { count: hidden })}
              </span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
