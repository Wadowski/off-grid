// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { formatDayHeading } from "../../../../calendar-views/time-format.js";
import { DAY_HEADING_CLASS, dayHeaderStyle, dayHeadingCss } from "./styles.js";
import type { DayHeaderProps } from "./types.js";

export const DayHeader = ({ date }: DayHeaderProps) => (
  <div className={DAY_HEADING_CLASS} style={dayHeaderStyle}>
    <style>{dayHeadingCss}</style>
    <Text variant="subheading" value={formatDayHeading(date)} />
  </div>
);
