// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { WEEK_DETAILED_STACKED_MIN_BLOCK_PX, WEEK_MIN_BLOCK_PX } from "../../constants.js";
import { WeekCompactEventCard } from "../week-compact-event-card/week-compact-event-card.js";
import { WeekDetailedEventCard } from "../week-detailed-event-card/week-detailed-event-card.js";
import { WeekDetailedShortEventCard } from "../week-detailed-short-event-card/week-detailed-short-event-card.js";
import type { WeekEventBlockProps } from "./types.js";

export const WeekEventBlock = ({
  block,
  startHour,
  pxPerMinute,
  timeZone,
  card,
}: WeekEventBlockProps) => {
  const top = (block.topMinutes - startHour * 60) * pxPerMinute;
  const height = Math.max(block.heightMinutes * pxPerMinute, WEEK_MIN_BLOCK_PX);
  const cardProps = {
    event: block.item,
    top,
    height,
    column: block.column,
    columnCount: block.columnCount,
    accent: calendarAccentColor(block.item.calendarColor),
    timeZone,
  };
  if (card === "compact") {
    return <WeekCompactEventCard {...cardProps} />;
  }
  if (height < WEEK_DETAILED_STACKED_MIN_BLOCK_PX) {
    return <WeekDetailedShortEventCard {...cardProps} />;
  }
  return <WeekDetailedEventCard {...cardProps} />;
};
