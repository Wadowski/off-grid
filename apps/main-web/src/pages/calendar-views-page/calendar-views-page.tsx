// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOpenNewEvent } from "../../calendar-events/use-open-new-event.js";
import { filterByCalendar } from "../../calendar-views/events-by-calendar.js";
import { useCalendarLayout } from "../../layouts/calendar-layout/calendar-layout-context.js";
import { useCalendarTimeZone } from "../../calendar-views/use-calendar-time-zone.js";
import { useCalendarView } from "../../calendar-views/use-calendar-view.js";
import { localDateOf, mondayOf, weekDates } from "../../calendar-views/week-days.js";
import { parseDateParam, periodLabel, shiftDate } from "../../calendar-views/view-navigation.js";
import { MaterialIcon } from "../../icons/material-icon/material-icon.js";
import { useSession } from "../../session/use-session.js";
import type { CalendarViewKind } from "@offgrid/contracts";
import { AgendaList } from "./components/agenda-list/agenda-list.js";
import { CalendarMultiSelect } from "./components/calendar-multi-select/calendar-multi-select.js";
import { DateNavigator } from "./components/date-navigator/date-navigator.js";
import { DayHeader } from "./components/day-header/day-header.js";
import { DayTimeline } from "./components/day-timeline/day-timeline.js";
import { MonthGrid } from "./components/month-grid/month-grid.js";
import { ViewSelect } from "./components/view-select/view-select.js";
import { WeekGrid } from "./components/week-grid/week-grid.js";
import { WeekStrip } from "./components/week-strip/week-strip.js";
import {
  BLEED_CLASS,
  calendarViewsControlsStyle,
  calendarViewsCss,
  calendarViewsFooterStyle,
  calendarViewsHeaderStyle,
  calendarViewsPageStyle,
  calendarViewsStatusStyle,
  FILTER_CLASS,
  FOOTER_CLASS,
  PAGE_CLASS,
  WEEK_STRIP_CLASS,
} from "./styles.js";
import type { CalendarViewsPageProps } from "./types.js";

export const CalendarViewsPage = ({ view }: CalendarViewsPageProps) => {
  const navigate = useNavigate();
  const openNewEvent = useOpenNewEvent();
  const layout = useCalendarLayout();
  const session = useSession();
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

  const goToView = (nextView: CalendarViewKind) =>
    navigate({ pathname: `/calendar/${nextView}`, search: `?date=${date}` });

  const gridWrapperClass = view === "week" || view === "day" ? BLEED_CLASS : undefined;

  return (
    <section className={PAGE_CLASS} style={calendarViewsPageStyle}>
      <style>{calendarViewsCss}</style>
      <header style={calendarViewsHeaderStyle}>
        <Text variant="heading" textId="calendar.heading" />
        <Button variant="ghost" size="small" onClick={() => navigate("/calendar/calendars")}>
          <Text variant="action" textId="calendar.mobileViews.calendars" />
        </Button>
      </header>
      <div style={calendarViewsControlsStyle}>
        <ViewSelect value={view} onChange={goToView} />
        <div className={FILTER_CLASS}>
          <CalendarMultiSelect
            calendars={layout.calendars.calendars}
            hidden={layout.hidden}
            onChange={layout.setHidden}
          />
        </div>
      </div>
      <DateNavigator
        label={periodLabel(view, date)}
        onPrevious={() => goToDate(shiftDate(date, view, -1))}
        onNext={() => goToDate(shiftDate(date, view, 1))}
        onToday={() => goToDate(localDateOf(new Date()))}
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
      {(view === "agenda" || view === "day") && (
        <div className={WEEK_STRIP_CLASS}>
          <WeekStrip
            dates={weekDates(mondayOf(date))}
            selectedDate={date}
            todayDate={today}
            onSelect={goToDate}
          />
        </div>
      )}
      {view === "agenda" && status === "ready" && (
        <>
          <DayHeader date={date} />
          <AgendaList events={selectedEvents} timeZone={timeZone} />
        </>
      )}
      {view === "month" && status === "ready" && (
        <MonthGrid
          days={visibleDays}
          selectedDate={date}
          todayDate={today}
          timeZone={timeZone}
          selectedEvents={selectedEvents}
          onSelect={goToDate}
        />
      )}
      {view === "week" && status === "ready" && (
        <div className={gridWrapperClass}>
          <WeekGrid
            days={visibleDays}
            selectedDate={date}
            todayDate={today}
            timeZone={timeZone}
            now={new Date()}
          />
        </div>
      )}
      {view === "day" && status === "ready" && (
        <>
          <DayHeader date={date} />
          <div className={gridWrapperClass}>
            <DayTimeline events={selectedEvents} date={date} timeZone={timeZone} now={new Date()} />
          </div>
        </>
      )}
      <div
        className={FOOTER_CLASS}
        data-testid="calendar-views-footer"
        style={calendarViewsFooterStyle}
      >
        <Button variant="primary" onClick={openNewEvent}>
          <MaterialIcon name="add" size="20px" color="currentColor" />
          <Text variant="action" textId="calendar.mobileViews.newEvent" />
        </Button>
      </div>
    </section>
  );
};
