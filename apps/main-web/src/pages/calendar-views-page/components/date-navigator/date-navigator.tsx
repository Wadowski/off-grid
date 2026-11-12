// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../../../../icons/material-icon/material-icon.js";
import {
  dateNavigatorArrowStyle,
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
        <button
          type="button"
          className="og-focusable"
          aria-label={t("calendar.mobileViews.previousPeriod")}
          style={dateNavigatorArrowStyle}
          onClick={onPrevious}
        >
          <MaterialIcon name="chevron_left" size="22px" color="currentColor" />
        </button>
        <span style={dateNavigatorLabelStyle}>
          <Text variant="subheading" value={label} />
        </span>
        <button
          type="button"
          className="og-focusable"
          aria-label={t("calendar.mobileViews.nextPeriod")}
          style={dateNavigatorArrowStyle}
          onClick={onNext}
        >
          <MaterialIcon name="chevron_right" size="22px" color="currentColor" />
        </button>
      </div>
      <Button variant="secondary" size="small" onClick={onToday}>
        <Text variant="action" textId="calendar.views.today" />
      </Button>
    </div>
  );
};
