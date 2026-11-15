// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent } from "react";
import { createContext, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eventDetailsTarget } from "./event-details-route.js";

export type OpenEvent = (eventId: string) => void;

export const EventOpenContext = createContext<OpenEvent | undefined>(undefined);

export const useOpenEventRoute = (): OpenEvent => {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (eventId: string) => {
      const target = eventDetailsTarget(location, eventId);
      navigate(target.to, { state: target.state });
    },
    [location, navigate],
  );
};

// Event cards are plain buttons when a calendar view provides the opener, and static otherwise.
export type EventOpenProps = {
  readonly role?: "button";
  readonly tabIndex?: 0;
  readonly "aria-haspopup"?: "dialog";
  readonly onClick?: () => void;
  readonly onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
};

export const useEventOpenProps = (eventId: string): EventOpenProps => {
  const openEvent = useContext(EventOpenContext);
  if (openEvent === undefined) {
    return {};
  }
  return {
    role: "button" as const,
    tabIndex: 0 as const,
    "aria-haspopup": "dialog" as const,
    onClick: () => openEvent(eventId),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openEvent(eventId);
      }
    },
  };
};
