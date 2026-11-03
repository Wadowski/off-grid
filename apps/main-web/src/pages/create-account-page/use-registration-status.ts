// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { anonymousAuthClient } from "../../api/anonymous-api-client.js";
import type { RegistrationState } from "./types.js";

export const useRegistrationStatus = (): RegistrationState => {
  const [state, setState] = useState<RegistrationState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    anonymousAuthClient
      .registrationStatus()
      .catch(() => ({ freshServer: false, registrationOpen: true }))
      .then((registration) => {
        if (active) {
          setState({ status: "ready", ...registration });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
};
