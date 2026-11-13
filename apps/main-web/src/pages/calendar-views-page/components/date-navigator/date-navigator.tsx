// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  dateNavigatorControlsStyle,
  dateNavigatorLabelStyle,
  dateNavigatorStyle,
} from "./styles.js";
import type { DateNavigatorProps } from "./types.js";

export const DateNavigator = ({ label, onPrevious, onNext, onToday }: DateNavigatorProps) => {
  const { t } = useTranslation();

  return (
    <div
      style={dateNavigatorStyle}
      role="group"
      aria-label={t("calendar.mobileViews.dateNavigation")}
    >
      <div style={dateNavigatorControlsStyle}>
        <Button
          variant="ghost"
          aria-label={t("calendar.mobileViews.previousPeriod")}
          onClick={onPrevious}
        >
          <MaterialIcon name="chevron_left" size="22px" color="currentColor" />
        </Button>
        <span style={dateNavigatorLabelStyle}>
          <Text variant="subheading" value={label} />
        </span>
        <Button variant="ghost" aria-label={t("calendar.mobileViews.nextPeriod")} onClick={onNext}>
          <MaterialIcon name="chevron_right" size="22px" color="currentColor" />
        </Button>
      </div>
      <Button variant="secondary" size="small" onClick={onToday}>
        <Text variant="action" textId="calendar.views.today" />
      </Button>
    </div>
  );
};
