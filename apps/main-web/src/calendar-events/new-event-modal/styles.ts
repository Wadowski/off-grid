// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { cssVar, tokens } from "@offgrid/ui";
import type { CSSProperties } from "react";

export const NEW_EVENT_MODAL_CLASS = "og-new-event-modal";

// The dialog and its glossy backdrop are styled in a stylesheet, because a backdrop is a pseudo-element
// and cannot take an inline style. The backdrop is a translucent surface with a blur, lighter in light theme.
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
}
dialog.${NEW_EVENT_MODAL_CLASS}::backdrop {
  background: color-mix(in srgb, ${cssVar("color-fg")} 15%, transparent);
  backdrop-filter: blur(4px);
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) dialog.${NEW_EVENT_MODAL_CLASS}::backdrop {
    background: color-mix(in srgb, ${cssVar("color-bg")} 65%, transparent);
    backdrop-filter: blur(12px);
  }
}
:root[data-theme="dark"] dialog.${NEW_EVENT_MODAL_CLASS}::backdrop {
  background: color-mix(in srgb, ${cssVar("color-bg")} 65%, transparent);
  backdrop-filter: blur(12px);
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
  padding: `${tokens.space[5]} ${tokens.space[6]} ${tokens.space[3]}`,
  borderBottom: `1px solid color-mix(in srgb, ${cssVar("color-line")} 40%, transparent)`,
};

export const newEventHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: tokens.font.size["headline-sm"],
  lineHeight: tokens.font.lineHeight["headline-sm"],
  letterSpacing: tokens.font.letterSpacing["headline-sm"],
  fontWeight: tokens.font.weight.semibold,
};

export const newEventBodyStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: `${tokens.space[4]} ${tokens.space[6]}`,
  overflowY: "auto",
  minHeight: 0,
};

export const newEventGroupStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[3],
  padding: tokens.space[4],
  borderRadius: tokens.radius.lg,
  background: cssVar("color-surface-low"),
};

export const newEventRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: tokens.space[3],
};

export const newEventLabelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: tokens.space[1],
  fontSize: tokens.font.size["label-sm"],
  lineHeight: tokens.font.lineHeight["label-sm"],
  color: cssVar("color-muted"),
};

export const newEventTextareaStyle: CSSProperties = {
  width: "100%",
  minHeight: "4.5rem",
  padding: `${tokens.space[2]} ${tokens.space[3]}`,
  border: `1px solid color-mix(in srgb, ${cssVar("color-line")} 60%, transparent)`,
  borderRadius: tokens.radius.md,
  background: cssVar("color-surface"),
  color: cssVar("color-fg"),
  fontFamily: tokens.font.family.base,
  fontSize: tokens.font.size["body-md"],
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
  padding: `${tokens.space[3]} ${tokens.space[6]}`,
  borderTop: `1px solid color-mix(in srgb, ${cssVar("color-line")} 40%, transparent)`,
  background: cssVar("color-surface-low"),
};

export const newEventActionsStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: tokens.space[2],
  marginLeft: "auto",
};
