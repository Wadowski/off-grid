// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatClockRange } from "../../../../../../calendar-views/time-format.js";
import {
  weekDetailedBlockStyle,
  weekDetailedRangeStyle,
  weekDetailedTitleStyle,
  weekLocationChipStyle,
} from "../../styles.js";
import type { WeekEventCardProps } from "../week-event-block/types.js";
import { useEventOpenProps } from "../../../../../../calendar-events/use-event-open-props.js";

export const WeekDetailedEventCard = ({
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
      style={weekDetailedBlockStyle(top, height, column, columnCount, accent)}
    >
      <div style={weekDetailedTitleStyle}>{event.title}</div>
      <div style={weekDetailedRangeStyle}>
        {formatClockRange(event.startsAt, event.endsAt, timeZone)}
      </div>
      {event.location && (
        <span style={weekLocationChipStyle(accent)} data-testid="week-event-location">
          {event.location}
        </span>
      )}
    </div>
  );
};
