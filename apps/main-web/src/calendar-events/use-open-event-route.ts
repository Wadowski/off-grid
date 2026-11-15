// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eventDetailsTarget } from "./event-details-route.js";
import type { OpenEvent } from "./types.js";

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
