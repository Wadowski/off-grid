// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { weekDayHeaderStyle, weekDayNumberStyle, weekTodayDotStyle } from "../../styles.js";
import type { WeekDayHeaderProps } from "./types.js";

export const WeekDayHeader = ({ date, label, selected, today, desktop }: WeekDayHeaderProps) => (
  <div style={weekDayHeaderStyle(today, desktop)}>
    <span>{label}</span>
    <span style={weekDayNumberStyle(selected, desktop)}>{Number(date.slice(8))}</span>
    {today && !selected ? <span style={weekTodayDotStyle} /> : null}
  </div>
);
