// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const SHORT_DAY_MONTH = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const partValue = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string =>
  parts.find((part) => part.type === type)?.value ?? "";

export const formatShortDate = (dateKey: string, withYear: boolean): string => {
  const parts = SHORT_DAY_MONTH.formatToParts(new Date(`${dateKey}T12:00:00Z`));
  const dayMonth = `${partValue(parts, "day")} ${partValue(parts, "month")}`;
  return withYear ? `${dayMonth} ${dateKey.slice(0, 4)}` : dayMonth;
};
