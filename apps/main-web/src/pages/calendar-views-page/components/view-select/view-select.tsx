// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Select } from "@offgrid/ui";
import type { CalendarViewKind } from "@offgrid/contracts";
import { useTranslation } from "react-i18next";
import type { ViewSelectProps } from "./types.js";

export const ViewSelect = ({ value, onChange }: ViewSelectProps) => {
  const { t } = useTranslation();

  return (
    <Select
      aria-label={t("calendar.mobileViews.viewControl")}
      data-testid="calendar-view-select"
      value={value}
      onChange={(event) => onChange(event.target.value as CalendarViewKind)}
      options={[
        { value: "agenda", label: t("calendar.views.agenda") },
        { value: "day", label: t("calendar.views.day") },
        { value: "week", label: t("calendar.views.week") },
        { value: "month", label: t("calendar.views.month") },
      ]}
    />
  );
};
