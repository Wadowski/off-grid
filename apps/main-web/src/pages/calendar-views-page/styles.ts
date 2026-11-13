// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

const SHELL_SIDEBAR_WIDTH = "16rem";
const PHONE_MAX_WIDTH = "767px";
const SHELL_PHONE_GUTTER = tokens.space[4];
const BODY_MARGIN = "0.5rem";
const PAGE_GUTTER = tokens.space[2];
export const NEW_EVENT_BAR_HEIGHT = "4rem";
const TAB_BAR_HEIGHT = "4.5rem";

export const PAGE_CLASS = "og-calendar-views-page";
export const BLEED_CLASS = "og-calendar-views-bleed";
export const FOOTER_CLASS = "og-calendar-views-footer";

export const calendarViewsCss = `
.${PAGE_CLASS} {
  box-sizing: border-box;
}
.${FOOTER_CLASS} {
  left: ${SHELL_SIDEBAR_WIDTH};
  bottom: env(safe-area-inset-bottom);
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
  borderTop: `1px solid ${cssVar("color-surface-high")}`,
  background: cssVar("color-surface"),
};

export const calendarViewsStatusStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: tokens.space[2],
};
