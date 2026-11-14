// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SegmentedControl } from "@offgrid/ui";
import type { CalendarViewKind } from "@offgrid/contracts";
import { useTranslation } from "react-i18next";
import type { ViewTabsProps } from "./types.js";

export const ViewTabs = ({ value, onChange }: ViewTabsProps) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl<CalendarViewKind>
      label={t("calendar.mobileViews.viewControl")}
      value={value}
      onChange={onChange}
      options={[
        { value: "agenda", label: t("calendar.views.agenda") },
        { value: "day", label: t("calendar.views.day") },
        { value: "week", label: t("calendar.views.week") },
        { value: "month", label: t("calendar.views.month") },
      ]}
    />
  );
};
