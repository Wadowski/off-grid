// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Avatar, Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { ALL_CALENDARS, type CalendarFilter } from "../../calendar-views/events-by-calendar.js";
import { useCalendarTimeZone } from "../../calendar-views/use-calendar-time-zone.js";
import { useCalendarView } from "../../calendar-views/use-calendar-view.js";
import { localDateOf } from "../../calendar-views/week-days.js";
import { parseDateParam, periodLabel, shiftDate } from "../../calendar-views/view-navigation.js";
import { FAMILY_ACCENT_COLORS } from "../../families/family-appearance.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useSession } from "../../session/use-session.js";
import type { ShellContext } from "../../types.js";
import { CalendarFilterBar } from "./components/calendar-filter-bar/calendar-filter-bar.js";
import { DateNavigator } from "./components/date-navigator/date-navigator.js";
import {
  calendarViewsActionsStyle,
  calendarViewsHeaderStyle,
  calendarViewsPageStyle,
  calendarViewsStatusStyle,
  calendarViewsTitleStyle,
  familyDotStyle,
  familyPillStyle,
} from "./styles.js";
import type { CalendarViewsPageProps } from "./types.js";

const initialsOf = (displayName: string): string =>
  displayName
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

export const CalendarViewsPage = ({ view }: CalendarViewsPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const shell = useOutletContext<ShellContext>();
  const session = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const date = parseDateParam(searchParams.get("date")) ?? localDateOf(new Date());
  const [filter, setFilter] = useState<CalendarFilter>(ALL_CALENDARS);
  const { status, retry } = useCalendarView(view, date);
  useCalendarTimeZone(session.status === "signedIn");

  const activeFamily =
    session.status === "signedIn"
      ? shell.families.find((family) => family.id === session.activeFamilyId)
      : undefined;
  const signedInName = session.status === "signedIn" ? session.user.displayName : null;

  const goToDate = (nextDate: string) => setSearchParams({ date: nextDate });

  return (
    <section style={calendarViewsPageStyle}>
      <header style={calendarViewsHeaderStyle}>
        <div style={calendarViewsTitleStyle}>
          {activeFamily !== undefined && (
            <span style={familyPillStyle}>
              <span
                aria-hidden="true"
                style={familyDotStyle(FAMILY_ACCENT_COLORS[activeFamily.accent].background)}
              />
              <Text variant="label" value={activeFamily.name} />
            </span>
          )}
          <Text variant="heading" textId="calendar.heading" />
        </div>
        <div style={calendarViewsActionsStyle}>
          <Button variant="ghost" aria-label={t("calendar.mobileViews.search")} disabled>
            <MaterialIcon name="search" size="22px" color="currentColor" />
          </Button>
          <Button variant="ghost" size="small" onClick={() => navigate("/calendar/calendars")}>
            <Text variant="action" textId="calendar.mobileViews.calendars" />
          </Button>
          {signedInName !== null && <Avatar initials={initialsOf(signedInName)} size="2rem" />}
        </div>
      </header>
      <DateNavigator
        label={periodLabel(view, date)}
        onPrevious={() => goToDate(shiftDate(date, view, -1))}
        onNext={() => goToDate(shiftDate(date, view, 1))}
        onToday={() => goToDate(localDateOf(new Date()))}
      />
      <CalendarFilterBar
        calendars={shell.calendars.calendars}
        selected={filter}
        onSelect={setFilter}
      />
      {status === "loading" && (
        <Text variant="status" role="status" textId="calendar.mobileViews.loading" />
      )}
      {status === "failed" && (
        <div role="alert" style={calendarViewsStatusStyle}>
          <Text variant="error" textId="calendar.mobileViews.loadFailed" />
          <Button variant="secondary" size="small" onClick={retry}>
            <Text variant="action" textId="calendar.mobileViews.retry" />
          </Button>
        </div>
      )}
    </section>
  );
};
