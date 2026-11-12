// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatDayHeading } from "../../../../calendar-views/time-format.js";
import { dayHeaderCountStyle, dayHeaderStyle, dayHeaderTitleStyle } from "./styles.js";
import type { DayHeaderProps } from "./types.js";

export const DayHeader = ({ date, scheduledCount }: DayHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div style={dayHeaderStyle}>
      <div style={dayHeaderTitleStyle}>
        <Text variant="subheading" value={formatDayHeading(date)} />
      </div>
      <span style={dayHeaderCountStyle}>
        {t("calendar.mobileViews.scheduled", { count: scheduledCount })}
      </span>
    </div>
  );
};
