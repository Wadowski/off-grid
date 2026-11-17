// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect, useState } from "react";
import { webSystemClient } from "../../../../api/web-api-client.js";
import type { RunningVersionState } from "./types.js";

export const useRunningVersion = (): RunningVersionState => {
  const [state, setState] = useState<RunningVersionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const loadVersion = async () => {
      try {
        const { version } = await webSystemClient.version();
        if (!cancelled) {
          setState({ status: "ready", version });
        }
      } catch {
        if (!cancelled) {
          setState({ status: "failed" });
        }
      }
    };
    void loadVersion();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
};
