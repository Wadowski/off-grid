// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { TextField } from "@offgrid/ui";
import { dateTimeBlockCardStyle, dateTimeBlockRowStyle } from "./styles.js";
import type { DateTimeBlockProps } from "./types.js";

export const DateTimeBlock = ({
  caption,
  dateLabel,
  timeLabel,
  date,
  time,
  showTime,
  onDate,
  onTime,
  error,
}: DateTimeBlockProps) => (
  <div style={dateTimeBlockCardStyle}>
    {caption}
    <div style={dateTimeBlockRowStyle(showTime)}>
      <TextField
        type="date"
        label={dateLabel}
        value={date}
        onChange={(event) => onDate(event.target.value)}
      />
      {showTime && (
        <TextField
          type="time"
          label={timeLabel}
          value={time}
          onChange={(event) => onTime(event.target.value)}
        />
      )}
    </div>
    {error}
  </div>
);
