// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";
import { useTranslation } from "react-i18next";
import { viewSelectStyle } from "./styles.js";
import type { ViewSelectProps } from "./types.js";

export const ViewSelect = ({ value, onChange }: ViewSelectProps) => {
  const { t } = useTranslation();

  return (
    <select
      aria-label={t("calendar.mobileViews.viewControl")}
      data-testid="calendar-view-select"
      className="og-focusable"
      style={viewSelectStyle}
      value={value}
      onChange={(event) => onChange(event.target.value as CalendarViewKind)}
    >
      <option value="agenda">{t("calendar.views.agenda")}</option>
      <option value="day">{t("calendar.views.day")}</option>
      <option value="week">{t("calendar.views.week")}</option>
      <option value="month">{t("calendar.views.month")}</option>
    </select>
  );
};
