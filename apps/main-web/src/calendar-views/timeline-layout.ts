// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { daysBetween } from "./week-days.js";
import { zonedMomentOf } from "./time-format.js";

export const MINUTES_PER_DAY = 24 * 60;
export const MIN_BLOCK_MINUTES = 15;

export type TimedInterval = { readonly startsAt: string; readonly endsAt: string };

export type PositionedBlock<Item> = {
  readonly item: Item;
  readonly topMinutes: number;
  readonly heightMinutes: number;
  readonly column: number;
  readonly columnCount: number;
};

type Span = { readonly item: TimedInterval; readonly start: number; readonly end: number };

const spanOnDate = (item: TimedInterval, date: string, timeZone: string): Span | null => {
  const start = zonedMomentOf(item.startsAt, timeZone);
  const end = zonedMomentOf(item.endsAt, timeZone);
  const startMinute = daysBetween(date, start.date) * MINUTES_PER_DAY + start.minutesOfDay;
  const endMinute = daysBetween(date, end.date) * MINUTES_PER_DAY + end.minutesOfDay;
  const clampedStart = Math.max(0, startMinute);
  const clampedEnd = Math.min(MINUTES_PER_DAY, endMinute);
  if (clampedEnd <= clampedStart) {
    return null;
  }
  return { item, start: clampedStart, end: clampedEnd };
};

const assignColumns = (cluster: readonly Span[]): Map<Span, number> => {
  const columnEnds: number[] = [];
  const assigned = new Map<Span, number>();
  for (const span of cluster) {
    const free = columnEnds.findIndex((end) => end <= span.start);
    const column = free === -1 ? columnEnds.length : free;
    columnEnds[column] = span.end;
    assigned.set(span, column);
  }
  return assigned;
};

export const layoutTimedEvents = <Item extends TimedInterval>(
  items: readonly Item[],
  date: string,
  timeZone: string,
): PositionedBlock<Item>[] => {
  const spans = items
    .map((item) => spanOnDate(item, date, timeZone))
    .filter((span): span is Span => span !== null)
    .sort((a, b) => a.start - b.start || b.end - a.end);

  const blocks: PositionedBlock<Item>[] = [];
  let cluster: Span[] = [];
  let clusterEnd = -1;

  const flush = () => {
    const columns = assignColumns(cluster);
    const columnCount = Math.max(...columns.values()) + 1;
    for (const span of cluster) {
      blocks.push({
        item: span.item as Item,
        topMinutes: span.start,
        heightMinutes: Math.max(span.end - span.start, MIN_BLOCK_MINUTES),
        column: columns.get(span) ?? 0,
        columnCount,
      });
    }
    cluster = [];
  };

  for (const span of spans) {
    if (cluster.length > 0 && span.start >= clusterEnd) {
      flush();
    }
    cluster.push(span);
    clusterEnd = Math.max(clusterEnd, span.end);
  }
  if (cluster.length > 0) {
    flush();
  }
  return blocks;
};

export const nowMinutesOnDate = (now: Date, date: string, timeZone: string): number | null => {
  const moment = zonedMomentOf(now, timeZone);
  return moment.date === date ? moment.minutesOfDay : null;
};
