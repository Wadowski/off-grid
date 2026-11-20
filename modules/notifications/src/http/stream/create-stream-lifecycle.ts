// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ServerResponse } from "node:http";
import type { StreamStop } from "../../types.js";

export const createStreamLifecycle = (response: ServerResponse) => {
  const stops: StreamStop[] = [];
  let ended = false;

  const endStream = (): void => {
    if (ended) {
      return;
    }
    ended = true;
    for (const stop of stops.splice(0)) {
      stop();
    }
    if (!response.writableEnded) {
      response.end();
    }
  };

  const addStop = (stop: StreamStop): void => {
    if (ended) {
      stop();
      return;
    }
    stops.push(stop);
  };

  return { endStream, addStop };
};
