// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { calendarAccentColor } from "../../../../../../calendars/calendar-accents.js";
import { useEventOpenProps } from "../../../../../../calendar-events/use-event-open-props.js";
import { formatDuration } from "../../../../../../calendar-views/format-duration.js";
import { durationMinutes, formatClockTime } from "../../../../../../calendar-views/time-format.js";
import {
  timelineBlockAccentStyle,
  timelineBlockDurationStyle,
  timelineBlockFooterStyle,
  timelineBlockHeaderStyle,
  timelineBlockRangeStyle,
  timelineBlockStyle,
  timelineBlockTitleStyle,
} from "./styles.js";
import type { TimelineEventBlockProps } from "./types.js";

export const TimelineEventBlock = ({
  event,
  timeZone,
  topPx,
  heightPx,
  column,
  columnCount,
  desktop,
}: TimelineEventBlockProps) => {
  const { t } = useTranslation();
  const open = useEventOpenProps(event.id);
  const accent = calendarAccentColor(event.calendarColor).background;
  const range = `${formatClockTime(event.startsAt, timeZone)} - ${formatClockTime(event.endsAt, timeZone)}`;

  return (
    <article
      {...open}
      data-testid={`timeline-event-${event.id}`}
      style={timelineBlockStyle(topPx, heightPx, column, columnCount, desktop)}
    >
      <span aria-hidden="true" style={timelineBlockAccentStyle(accent)} />
      <div style={timelineBlockHeaderStyle}>
        <div style={timelineBlockTitleStyle}>
          <Text variant="subheading" value={event.title} />
        </div>
        <span style={timelineBlockRangeStyle}>{range}</span>
      </div>
      {event.location !== null && (
        <div style={timelineBlockTitleStyle} data-testid="timeline-event-location">
          <Text variant="body" value={event.location} />
        </div>
      )}
      <div style={timelineBlockFooterStyle}>
        <span style={timelineBlockDurationStyle}>
          {formatDuration(durationMinutes(event.startsAt, event.endsAt), t)}
        </span>
      </div>
    </article>
  );
};
