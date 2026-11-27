// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const SHELL_SIDEBAR_WIDTH = "16rem";
const SHELL_PHONE_GUTTER = tokens.space[4];
const BODY_MARGIN = "0.5rem";
const PAGE_GUTTER = tokens.space[2];
const NEW_EVENT_BAR_HEIGHT = "4rem";
const TAB_BAR_HEIGHT = "4.5rem";
const APP_HEADER_HEIGHT = "3.5rem";
const APP_SHELL_TOP_PADDING = `calc(${APP_HEADER_HEIGHT} + ${tokens.space[4]})`;
const APP_SHELL_BOTTOM_PADDING = tokens.space[6];
const PHONE_PAGE_MARGIN = `calc(-1 * (${SHELL_PHONE_GUTTER} + ${BODY_MARGIN} - ${PAGE_GUTTER}))`;

export const PAGE_CLASS = "og-calendar-views-page";
export const WEEK_STRIP_CLASS = "og-calendar-views-week-strip";

export const calendarViewsPageStyle = (phone: boolean, desktopDay: boolean): CSSProperties => ({
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  minWidth: 0,
  boxSizing: "border-box",
  paddingBottom: NEW_EVENT_BAR_HEIGHT,
  ...(phone ? { marginLeft: PHONE_PAGE_MARGIN, marginRight: PHONE_PAGE_MARGIN } : {}),
  ...(desktopDay
    ? {
        minHeight: `calc(100vh - ${APP_SHELL_TOP_PADDING} - ${APP_SHELL_BOTTOM_PADDING} - 2 * ${BODY_MARGIN})`,
      }
    : {}),
});

export const calendarViewsBleedStyle = (phone: boolean): CSSProperties | undefined =>
  phone ? { marginLeft: `-${PAGE_GUTTER}`, marginRight: `-${PAGE_GUTTER}` } : undefined;

export const calendarViewsFilterStyle = (narrow: boolean): CSSProperties =>
  narrow ? { position: "relative", zIndex: 40 } : { display: "none" };

export const calendarViewsWeekStripStyle = (narrow: boolean): CSSProperties =>
  narrow
    ? {
        position: "sticky",
        top: APP_HEADER_HEIGHT,
        zIndex: 30,
        background: cssVar("color-bg"),
        paddingBottom: tokens.space[3],
        marginBottom: `-${tokens.space[3]}`,
      }
    : { display: "none" };

export const calendarViewsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

const calendarViewsControlsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const calendarViewsTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const calendarViewsTabsRowStyle: CSSProperties = {
  minWidth: 0,
};

export const calendarViewsDayCommandStyle: CSSProperties = {
  ...calendarViewsControlsStyle,
  flexWrap: "wrap",
  gap: tokens.space[3],
};

export const calendarViewsFooterStyle = (phone: boolean): CSSProperties => ({
  position: "fixed",
  right: 0,
  left: phone ? 0 : SHELL_SIDEBAR_WIDTH,
  bottom: phone
    ? `calc(${TAB_BAR_HEIGHT} + env(safe-area-inset-bottom))`
    : "env(safe-area-inset-bottom)",
  zIndex: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  boxSizing: "border-box",
  height: NEW_EVENT_BAR_HEIGHT,
  padding: `0 ${tokens.space[4]}`,
  pointerEvents: "none",
});

export const calendarViewsFooterButtonStyle: CSSProperties = {
  pointerEvents: "auto",
  display: "flex",
  borderRadius: cssVar("radius-md"),
  boxShadow: cssVar("elevation-2"),
};

export const calendarViewsStatusStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: tokens.space[2],
};
