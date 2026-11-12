// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { CalendarViewKind } from "@offgrid/contracts";
import { SegmentedControl, type SegmentedControlOption } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import type { ViewSegmentedControlProps } from "./types.js";

export const ViewSegmentedControl = ({ value, onChange }: ViewSegmentedControlProps) => {
  const { t } = useTranslation();
  const options: readonly SegmentedControlOption<CalendarViewKind>[] = [
    { value: "agenda", label: t("calendar.views.agenda") },
    { value: "day", label: t("calendar.views.day") },
    { value: "week", label: t("calendar.views.week") },
    { value: "month", label: t("calendar.views.month") },
  ];

  return (
    <SegmentedControl
      label={t("calendar.mobileViews.viewControl")}
      options={options}
      value={value}
      onChange={onChange}
    />
  );
};
