// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
import { weekBlockStyle, weekBlockTimeStyle, weekBlockTitleStyle } from "../../styles.js";
import type { WeekEventCardProps } from "../week-event-block/types.js";
import { useEventOpenProps } from "../../../../../../calendar-events/use-event-open-props.js";

export const WeekCompactEventCard = ({
  event,
  top,
  height,
  column,
  columnCount,
  accent,
  timeZone,
}: WeekEventCardProps) => {
  const open = useEventOpenProps(event.id);
  return (
    <div
      {...open}
      data-testid={`week-event-${event.id}`}
      style={weekBlockStyle(top, height, column, columnCount, accent.background)}
    >
      <div style={weekBlockTitleStyle}>{event.title}</div>
      <div style={weekBlockTimeStyle}>{formatClockTime(event.startsAt, timeZone)}</div>
    </div>
  );
};
