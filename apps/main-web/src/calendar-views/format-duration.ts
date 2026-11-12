// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TFunction } from "i18next";

export const formatDuration = (minutes: number, t: TFunction): string => {
  if (minutes < 60) {
    return t("calendar.mobileViews.duration", { minutes });
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? t("calendar.mobileViews.durationHours", { hours })
    : t("calendar.mobileViews.durationHoursMinutes", { hours, minutes: rest });
};
