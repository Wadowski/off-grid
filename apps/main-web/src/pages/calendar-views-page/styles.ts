// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const SHELL_SIDEBAR_WIDTH = "16rem";
const PHONE_MAX_WIDTH = "767px";
const SIDEBAR_MIN_WIDTH = "640px";
const SHELL_PHONE_GUTTER = tokens.space[4];
const BODY_MARGIN = "0.5rem";
const PAGE_GUTTER = tokens.space[2];
export const NEW_EVENT_BAR_HEIGHT = "4rem";
const TAB_BAR_HEIGHT = "4.5rem";
// Must match the app shell: the fixed header height, and the main padding around the page.
const APP_HEADER_HEIGHT = "3.5rem";
const APP_SHELL_TOP_PADDING = `calc(${APP_HEADER_HEIGHT} + ${tokens.space[4]})`;
const APP_SHELL_BOTTOM_PADDING = tokens.space[6];

export const PAGE_CLASS = "og-calendar-views-page";
export const BLEED_CLASS = "og-calendar-views-bleed";
export const FOOTER_CLASS = "og-calendar-views-footer";
export const FILTER_CLASS = "og-calendar-views-filter";
export const WEEK_STRIP_CLASS = "og-calendar-views-week-strip";

export const calendarViewsCss = `
.${PAGE_CLASS} {
  box-sizing: border-box;
}
.${FOOTER_CLASS} {
  left: ${SHELL_SIDEBAR_WIDTH};
  bottom: env(safe-area-inset-bottom);
}
@media (min-width: ${SIDEBAR_MIN_WIDTH}) {
  .${FILTER_CLASS},
  .${WEEK_STRIP_CLASS} {
    display: none;
  }
}
@media (max-width: ${PHONE_MAX_WIDTH}) {
  .${PAGE_CLASS} {
    margin-left: calc(-1 * (${SHELL_PHONE_GUTTER} + ${BODY_MARGIN} - ${PAGE_GUTTER}));
    margin-right: calc(-1 * (${SHELL_PHONE_GUTTER} + ${BODY_MARGIN} - ${PAGE_GUTTER}));
  }
  .${BLEED_CLASS} {
    margin-left: -${PAGE_GUTTER};
    margin-right: -${PAGE_GUTTER};
  }
  .${FOOTER_CLASS} {
    left: 0;
    bottom: calc(${TAB_BAR_HEIGHT} + env(safe-area-inset-bottom));
  }
  .${WEEK_STRIP_CLASS} {
    position: sticky;
    top: ${APP_HEADER_HEIGHT};
    z-index: 30;
    background: var(--og-color-bg);
    padding-bottom: ${tokens.space[3]};
    margin-bottom: -${tokens.space[3]};
  }
}
`;

export const calendarViewsPageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  minWidth: 0,
  paddingBottom: NEW_EVENT_BAR_HEIGHT,
};

export const calendarViewsHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  minWidth: 0,
};

export const calendarViewsControlsStyle: CSSProperties = {
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

// Desktop day view: the page fills the window height so the timeline can reach the footer bar.
export const calendarViewsDayPageStyle: CSSProperties = {
  ...calendarViewsPageStyle,
  minHeight: `calc(100vh - ${APP_SHELL_TOP_PADDING} - ${APP_SHELL_BOTTOM_PADDING} - 2 * ${BODY_MARGIN})`,
};

export const calendarViewsDayFillStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
};

export const calendarViewsDayCommandStyle: CSSProperties = {
  ...calendarViewsControlsStyle,
  flexWrap: "wrap",
  gap: tokens.space[3],
};

export const calendarViewsFooterStyle: CSSProperties = {
  position: "fixed",
  right: 0,
  zIndex: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  boxSizing: "border-box",
  height: NEW_EVENT_BAR_HEIGHT,
  padding: `0 ${tokens.space[4]}`,
  pointerEvents: "none",
};

// The bar is see-through: only the button takes taps, so the content behind it stays usable.
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
