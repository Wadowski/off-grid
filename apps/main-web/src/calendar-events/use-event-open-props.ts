// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent } from "react";
import { useContext } from "react";
import { EventOpenContext } from "./event-open-context.js";
import type { EventOpenProps } from "./types.js";

export const useEventOpenProps = (eventId: string): EventOpenProps => {
  const openEvent = useContext(EventOpenContext);
  if (openEvent === undefined) {
    return {};
  }
  return {
    role: "button",
    tabIndex: 0,
    "aria-haspopup": "dialog",
    onClick: () => openEvent(eventId),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEvent(eventId);
      }
    },
  };
};
