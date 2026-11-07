// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { anonymousAuthClient } from "../../api/anonymous-api-client.js";

export const usePasswordRecoveryOptions = (): boolean => {
  const [emailCodeAvailable, setEmailCodeAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    anonymousAuthClient
      .passwordRecoveryOptions()
      .then((options) => {
        if (active) {
          setEmailCodeAvailable(options.emailCodeAvailable);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return emailCodeAvailable;
};
