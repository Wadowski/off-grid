// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { webSystemClient } from "../../../../api/web-api-client.js";
import type { RunningVersionState } from "./types.js";

export const useRunningVersion = (): RunningVersionState => {
  const [state, setState] = useState<RunningVersionState>({ status: "loading" });

  useEffect(() => {
    const loadVersion = async () => {
      try {
        const { version } = await webSystemClient.version();
        setState({ status: "ready", version });
      } catch {
        setState({ status: "failed" });
      }
    };
    void loadVersion();
  }, []);

  return state;
};
