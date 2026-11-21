// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback, useEffect, useState } from "react";
import { webSystemClient } from "../../../../api/web-api-client.js";
import { UPDATE_STATUS_POLL_INTERVAL_MS } from "./constants.js";
import type { UpdateStatusState } from "./types.js";

export const useUpdateStatus = () => {
  const [state, setState] = useState<UpdateStatusState>({ status: "loading" });

  const reload = useCallback(async () => {
    try {
      const update = await webSystemClient.update();
      setState({ status: "ready", update, unreachable: false });
    } catch {
      setState((current) =>
        current.status === "ready" ? { ...current, unreachable: true } : { status: "failed" },
      );
    }
  }, []);

  const markRunning = useCallback(() => {
    setState((current) =>
      current.status === "ready"
        ? {
            ...current,
            unreachable: false,
            update: { ...current.update, running: true, runState: "running" },
          }
        : current,
    );
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const running = state.status === "ready" && state.update.running;

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    const timer = setTimeout(() => void reload(), UPDATE_STATUS_POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [running, state, reload]);

  return { state, reload, markRunning };
};
