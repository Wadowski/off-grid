// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const NEW_EVENT_MODAL_CLASS = "og-new-event-modal";
export const NEW_EVENT_SWITCH_CLASS = "og-new-event-switch";

// The dialog, its glossy backdrop and the all-day switch are styled in a stylesheet, because a backdrop is
// a pseudo-element and the switch needs its thumb and checked state. The backdrop is a translucent surface
// with a blur, lighter in light theme.
export const newEventModalCss = `
dialog.${NEW_EVENT_MODAL_CLASS} {
  width: min(624px, calc(100vw - 2rem));
  max-height: calc(100vh - 3rem);
  padding: 0;
  border: 1px solid color-mix(in srgb, ${cssVar("color-line")} 60%, transparent);
  border-radius: ${tokens.radius.lg};
  background: ${cssVar("color-surface")};
  color: ${cssVar("color-fg")};
  box-shadow: ${tokens.elevation[2]};
  overflow: hidden;
  color-scheme: light;
}
dialog.${NEW_EVENT_MODAL_CLASS}::backdrop {
  background: color-mix(in srgb, ${cssVar("color-fg")} 15%, transparent);
  backdrop-filter: blur(4px);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) dialog.${NEW_EVENT_MODAL_CLASS} {
    color-scheme: dark;
  }
  :root:not([data-theme="light"]) dialog.${NEW_EVENT_MODAL_CLASS}::backdrop {
    background: color-mix(in srgb, ${cssVar("color-bg")} 65%, transparent);
    backdrop-filter: blur(12px);
  }
}
:root[data-theme="dark"] dialog.${NEW_EVENT_MODAL_CLASS} {
  color-scheme: dark;
}
:root[data-theme="dark"] dialog.${NEW_EVENT_MODAL_CLASS}::backdrop {
  background: color-mix(in srgb, ${cssVar("color-bg")} 65%, transparent);
  backdrop-filter: blur(12px);
}
dialog.${NEW_EVENT_MODAL_CLASS} input:focus-visible,
dialog.${NEW_EVENT_MODAL_CLASS} select:focus-visible,
dialog.${NEW_EVENT_MODAL_CLASS} textarea:focus-visible {
  outline: none;
  box-shadow: ${tokens.elevation.focus};
}
dialog.${NEW_EVENT_MODAL_CLASS} input.${NEW_EVENT_SWITCH_CLASS} {
  appearance: none;
  position: relative;
  flex-shrink: 0;
  width: 2.25rem;
  height: 1.25rem;
  margin: 0;
  border-radius: ${tokens.radius.full};
  background: color-mix(in srgb, ${cssVar("color-muted")} 35%, transparent);
  cursor: pointer;
  transition: background-color 150ms ease-in-out;
}
dialog.${NEW_EVENT_MODAL_CLASS} input.${NEW_EVENT_SWITCH_CLASS}::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 1rem;
  height: 1rem;
  border-radius: ${tokens.radius.full};
  background: ${cssVar("color-surface")};
  box-shadow: ${tokens.elevation[1]};
  transition: transform 150ms ease-in-out;
}
dialog.${NEW_EVENT_MODAL_CLASS} input.${NEW_EVENT_SWITCH_CLASS}:checked {
  background: ${cssVar("color-primary")};
}
dialog.${NEW_EVENT_MODAL_CLASS} input.${NEW_EVENT_SWITCH_CLASS}:checked::after {
  transform: translateX(1rem);
}
@media (max-width: 40rem) {
  dialog.${NEW_EVENT_MODAL_CLASS} {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border: none;
    border-radius: 0;
  }
}
`;

const labelCaps: CSSProperties = {
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  letterSpacing: "0.06em",
  fontWeight: tokens.font.weight.semibold,
  textTransform: "uppercase",
  color: cssVar("color-muted"),
};

const fieldBase: CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: "none",
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  fontFamily: tokens.font.family.base,
  fontSize: tokens.font.size["body-md"],
  lineHeight: tokens.font.lineHeight["body-md"],
  letterSpacing: tokens.font.letterSpacing["body-md"],
};

export const newEventFormStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  maxHeight: "inherit",
};

export const newEventHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: `${tokens.space[4]} ${tokens.space[5]}`,
  borderBottom: `1px solid color-mix(in srgb, ${cssVar("color-line")} 40%, transparent)`,
};

export const newEventTitleGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  minWidth: 0,
};

export const newEventHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: tokens.font.size["headline-sm"],
  lineHeight: tokens.font.lineHeight["headline-sm"],
  letterSpacing: tokens.font.letterSpacing["headline-sm"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventHeaderActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const newEventBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `${tokens.space[4]} ${tokens.space[5]}`,
  overflowY: "auto",
  minHeight: 0,
};

export const newEventGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: tokens.space[3],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const newEventGroupHeadStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
};

export const newEventGroupTitleStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  fontSize: tokens.font.size["label-md"],
  lineHeight: tokens.font.lineHeight["label-md"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventSwitchLabelStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  cursor: "pointer",
  ...labelCaps,
  textTransform: "none",
  letterSpacing: tokens.font.letterSpacing["label-sm"],
  fontWeight: tokens.font.weight.medium,
};

export const newEventTitleCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const newEventTitleLabelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  ...labelCaps,
};

export const newEventTitleInputStyle: CSSProperties = {
  ...fieldBase,
  background: "transparent",
  fontSize: tokens.font.size["headline-md"],
  lineHeight: tokens.font.lineHeight["headline-md"],
  letterSpacing: tokens.font.letterSpacing["headline-md"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventTimesStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(11rem, 1fr))",
  gap: tokens.space[3],
};

export const newEventTimeCardStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[2],
  padding: tokens.space[3],
  borderRadius: tokens.radius.md,
  background: cssVar("color-surface"),
  boxShadow: tokens.elevation[1],
};

export const newEventTimeRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
};

export const newEventDateInputStyle: CSSProperties = {
  ...fieldBase,
  flex: "1 1 auto",
  padding: `${tokens.space[1]} ${tokens.space[2]}`,
  borderRadius: tokens.radius.sm,
  background: cssVar("color-surface-low"),
  fontWeight: tokens.font.weight.semibold,
};

export const newEventTimeInputStyle: CSSProperties = {
  ...newEventDateInputStyle,
  flex: "0 0 auto",
  width: "7.5rem",
  color: cssVar("color-primary"),
};

export const newEventZoneStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  color: cssVar("color-muted"),
};

export const newEventLabelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  color: cssVar("color-muted"),
};

// A field with its label on one line, the input underneath it across the full width.
export const newEventFieldLabelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  width: "100%",
  minWidth: 0,
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  color: cssVar("color-muted"),
};

export const newEventLabelRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[1],
};

// The calendar picker is filled with the colour of the calendar it shows.
export const newEventCalendarSelectStyle = (accent: {
  readonly background: string;
  readonly color: string;
}): CSSProperties => ({
  padding: `${tokens.space[1]} ${tokens.space[3]}`,
  border: "none",
  borderRadius: tokens.radius.md,
  background: accent.background,
  color: accent.color,
  fontFamily: tokens.font.family.base,
  fontSize: tokens.font.size["label-md"],
  lineHeight: tokens.font.lineHeight["label-md"],
  fontWeight: tokens.font.weight.semibold,
  cursor: "pointer",
  boxShadow: tokens.elevation[1],
});

export const newEventFieldStyle: CSSProperties = {
  ...fieldBase,
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.md,
  boxShadow: tokens.elevation[1],
};

export const newEventTextareaStyle: CSSProperties = {
  ...fieldBase,
  minHeight: "4.5rem",
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  borderRadius: tokens.radius.md,
  boxShadow: tokens.elevation[1],
  resize: "vertical",
};

export const newEventErrorStyle: CSSProperties = {
  margin: 0,
};

export const newEventFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: tokens.space[2],
  padding: `${tokens.space[3]} ${tokens.space[5]}`,
  borderTop: `1px solid color-mix(in srgb, ${cssVar("color-line")} 40%, transparent)`,
  background: cssVar("color-surface-low"),
};

export const newEventActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  marginLeft: "auto",
};
