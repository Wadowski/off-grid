// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatClockRange } from "../../../../../../calendar-views/time-format.js";
import {
  weekDetailedShortBlockStyle,
  weekDetailedShortRangeStyle,
  weekDetailedShortTitleStyle,
} from "../../styles.js";
import type { WeekEventCardProps } from "../week-event-block/types.js";
import { useEventOpenProps } from "../../../../../../calendar-events/use-event-open-props.js";

export const WeekDetailedShortEventCard = ({
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
      style={weekDetailedShortBlockStyle(top, height, column, columnCount, accent)}
    >
      <div style={weekDetailedShortTitleStyle}>{event.title}</div>
      <div style={weekDetailedShortRangeStyle}>
        {formatClockRange(event.startsAt, event.endsAt, timeZone)}
      </div>
    </div>
  );
};
