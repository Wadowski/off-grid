// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PHONE_CHROME_MEDIA_QUERY } from "../../constants.js";
import { useOpenNewEvent } from "../../calendar-events/use-open-new-event.js";
import { EventOpenContext } from "../../calendar-events/event-open-context.js";
import { useOpenEventRoute } from "../../calendar-events/use-open-event-route.js";
import { filterByCalendar } from "../../calendar-views/events-by-calendar.js";
import { formatDayHeading } from "../../calendar-views/time-format.js";
import { useCalendarTimeZone } from "../../calendar-views/use-calendar-time-zone.js";
import { useCalendarView } from "../../calendar-views/use-calendar-view.js";
import { localDateOf, mondayOf, weekDates } from "../../calendar-views/week-days.js";
import { parseDateParam, periodLabel, shiftDate } from "../../calendar-views/view-navigation.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useCalendarLayout } from "../../layouts/calendar-layout/calendar-layout-context.js";
import { useIsNarrow } from "../../media/use-is-narrow.js";
import { useMediaQuery } from "../../media/use-media-query.js";
import { useSession } from "../../session/use-session.js";
import type { CalendarViewKind } from "@offgrid/contracts";
import { AgendaList } from "./components/agenda-list/agenda-list.js";
import { CalendarMultiSelect } from "./components/calendar-multi-select/calendar-multi-select.js";
import { DateNavigator } from "./components/date-navigator/date-navigator.js";
import { DayTimeline } from "./components/day-timeline/day-timeline.js";
import { timelineFillSectionStyle } from "./components/day-timeline/styles.js";
import { MonthGrid } from "./components/month-grid/month-grid.js";
import { MonthGridDesktop } from "./components/month-grid-desktop/month-grid-desktop.js";
import { DESKTOP_WEEK_SIZE, PHONE_WEEK_SIZE } from "./components/week-grid/constants.js";
import { WeekGrid } from "./components/week-grid/week-grid.js";
import { ViewTabs } from "./components/view-tabs/view-tabs.js";
import { WeekStrip } from "./components/week-strip/week-strip.js";
import {
  calendarViewsBleedStyle,
  calendarViewsDayCommandStyle,
  calendarViewsFilterStyle,
  calendarViewsFooterButtonStyle,
  calendarViewsFooterStyle,
  calendarViewsHeaderStyle,
  calendarViewsPageStyle,
  calendarViewsStatusStyle,
  calendarViewsTabsRowStyle,
  calendarViewsTitleStyle,
  calendarViewsWeekStripStyle,
  PAGE_CLASS,
  WEEK_STRIP_CLASS,
} from "./styles.js";
import type { CalendarViewsPageProps } from "./types.js";

export const CalendarViewsPage = ({ view }: CalendarViewsPageProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const openNewEvent = useOpenNewEvent();
  const openEvent = useOpenEventRoute();
  const layout = useCalendarLayout();
  const session = useSession();
  const narrow = useIsNarrow();
  const phone = useMediaQuery(PHONE_CHROME_MEDIA_QUERY);
  const [searchParams, setSearchParams] = useSearchParams();
  const date = parseDateParam(searchParams.get("date")) ?? localDateOf(new Date());
  const { status, days, retry } = useCalendarView(view, date);
  const { timeZone } = useCalendarTimeZone(session.status === "signedIn");
  const today = localDateOf(new Date());
  const visibleDays = days.map((day) => ({
    ...day,
    events: filterByCalendar(day.events, layout.hidden),
  }));
  const selectedEvents = visibleDays.find((day) => day.date === date)?.events ?? [];

  const goToDate = (nextDate: string) => setSearchParams({ date: nextDate });

  const goToDay = (nextDate: string) =>
    navigate({ pathname: "/calendar/day", search: `?date=${nextDate}` });

  const navigatorHandlers = {
    onPrevious: () => goToDate(shiftDate(date, view, -1)),
    onNext: () => goToDate(shiftDate(date, view, 1)),
    onToday: () => goToDate(localDateOf(new Date())),
  };

  const goToView = (nextView: CalendarViewKind) =>
    navigate({ pathname: `/calendar/${nextView}`, search: `?date=${date}` });

  const bleedStyle = view === "week" || view === "day" ? calendarViewsBleedStyle(phone) : undefined;
  const desktopDay = view === "day" && !narrow;
  const viewTabs = <ViewTabs value={view} onChange={goToView} />;

  return (
    <EventOpenContext.Provider value={openEvent}>
      <section className={PAGE_CLASS} style={calendarViewsPageStyle(phone, desktopDay)}>
        <header style={calendarViewsHeaderStyle}>
          <div style={calendarViewsTitleStyle}>
            <Text variant="heading" textId="calendar.heading" />
            {narrow && (
              <Button
                variant="ghost"
                aria-label={t("calendar.mobileViews.manageCalendars")}
                onClick={() => navigate("/calendar/calendars")}
              >
                <MaterialIcon name="edit_calendar" size="24px" color="currentColor" />
              </Button>
            )}
          </div>
          <div style={calendarViewsFilterStyle(narrow)}>
            <CalendarMultiSelect
              calendars={layout.calendars.calendars}
              hidden={layout.hidden}
              onChange={layout.setHidden}
            />
          </div>
          {!narrow && viewTabs}
        </header>
        {narrow && <div style={calendarViewsTabsRowStyle}>{viewTabs}</div>}
        {desktopDay ? (
          <div data-testid="day-command-row" style={calendarViewsDayCommandStyle}>
            <DateNavigator label={formatDayHeading(date)} {...navigatorHandlers} />
          </div>
        ) : (
          <DateNavigator label={periodLabel(view, date)} {...navigatorHandlers} />
        )}
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
        {(view === "agenda" || view === "day") && (
          <div className={WEEK_STRIP_CLASS} style={calendarViewsWeekStripStyle(narrow)}>
            <WeekStrip
              dates={weekDates(mondayOf(date))}
              selectedDate={date}
              todayDate={today}
              onSelect={goToDate}
            />
          </div>
        )}
        {view === "agenda" && status === "ready" && (
          <AgendaList events={selectedEvents} timeZone={timeZone} />
        )}
        {view === "month" &&
          status === "ready" &&
          (phone ? (
            <MonthGrid
              days={visibleDays}
              selectedDate={date}
              todayDate={today}
              timeZone={timeZone}
              selectedEvents={selectedEvents}
              onSelect={goToDate}
            />
          ) : (
            <MonthGridDesktop
              days={visibleDays}
              selectedDate={date}
              todayDate={today}
              timeZone={timeZone}
              onOpenDay={goToDay}
            />
          ))}
        {view === "week" && status === "ready" && (
          <div style={bleedStyle}>
            <WeekGrid
              days={visibleDays}
              selectedDate={date}
              todayDate={today}
              timeZone={timeZone}
              now={new Date()}
              size={narrow ? PHONE_WEEK_SIZE : DESKTOP_WEEK_SIZE}
            />
          </div>
        )}
        {view === "day" && status === "ready" && (
          <div style={desktopDay ? timelineFillSectionStyle : bleedStyle}>
            <DayTimeline events={selectedEvents} date={date} timeZone={timeZone} now={new Date()} />
          </div>
        )}
        <div data-testid="calendar-views-footer" style={calendarViewsFooterStyle(phone)}>
          <div style={calendarViewsFooterButtonStyle}>
            <Button variant="primary" onClick={openNewEvent}>
              <MaterialIcon name="add" size="20px" color="currentColor" />
              <Text variant="action" textId="calendar.mobileViews.newEvent" />
            </Button>
          </div>
        </div>
      </section>
    </EventOpenContext.Provider>
  );
};
