// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NEW_EVENT_PATH, newEventTarget } from "./new-event-route.js";

export const useOpenNewEvent = (): (() => void) => {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(() => {
    if (location.pathname === NEW_EVENT_PATH) {
      return;
    }
    const target = newEventTarget(location);
    navigate(target.to, { state: target.state });
  }, [location, navigate]);
};
