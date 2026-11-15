// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { formatClockTime } from "../../../../../../calendar-views/time-format.js";
import {
  weekNowDotStyle,
  weekNowGutterStyle,
  weekNowLineStyle,
  weekNowOverlayBadgeStyle,
  weekNowOverlayStyle,
} from "../../styles.js";
import type { WeekNowLineProps } from "./types.js";

export const WeekNowLine = ({ topPx, gutter, now, timeZone }: WeekNowLineProps) => (
  <div data-testid="week-now" style={weekNowOverlayStyle(topPx)}>
    <span style={weekNowGutterStyle(gutter)} />
    <span style={weekNowDotStyle} />
    <span style={weekNowLineStyle} />
    <span style={weekNowOverlayBadgeStyle} data-testid="week-now-time">
      {formatClockTime(now.toISOString(), timeZone)}
    </span>
  </div>
);
