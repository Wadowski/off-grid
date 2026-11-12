// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { formatDayHeading } from "../../../../../../calendar-views/time-format.js";
import { AgendaList } from "../../../agenda-list/agenda-list.js";
import {
  selectedDaySheetBodyStyle,
  selectedDaySheetCountStyle,
  selectedDaySheetGrabberStyle,
  selectedDaySheetHeaderStyle,
  selectedDaySheetStyle,
} from "./styles.js";
import type { SelectedDaySheetProps } from "./types.js";

export const SelectedDaySheet = ({ date, events, timeZone }: SelectedDaySheetProps) => {
  const { t } = useTranslation();

  return (
    <section aria-label={t("calendar.mobileViews.selectedDay")} style={selectedDaySheetStyle}>
      <span aria-hidden="true" style={selectedDaySheetGrabberStyle} />
      <div style={selectedDaySheetHeaderStyle}>
        <Text variant="subheading" value={formatDayHeading(date)} />
        <span style={selectedDaySheetCountStyle}>
          {t("calendar.mobileViews.events", { count: events.length })}
        </span>
      </div>
      <div style={selectedDaySheetBodyStyle}>
        <AgendaList events={events} timeZone={timeZone} />
      </div>
    </section>
  );
};
