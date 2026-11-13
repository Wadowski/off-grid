// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { formatDayHeading } from "../../../../calendar-views/time-format.js";
import { dayHeaderLabelStyle, dayHeaderStyle } from "./styles.js";
import type { DayHeaderProps } from "./types.js";

export const DayHeader = ({ date }: DayHeaderProps) => (
  <div style={dayHeaderStyle}>
    <span style={dayHeaderLabelStyle}>
      <Text variant="subheading" value={formatDayHeading(date)} />
    </span>
  </div>
);
