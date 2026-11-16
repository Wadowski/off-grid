// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ChildProcess } from "node:child_process";
import { FORWARDED_SIGNALS } from "./constants.js";

export const forwardSignals = (child: ChildProcess): (() => void) => {
  let received = false;
  const listeners = FORWARDED_SIGNALS.map((signal) => {
    const listener = () => {
      child.kill(received ? "SIGKILL" : signal);
      received = true;
    };
    process.on(signal, listener);
    return { signal, listener };
  });
  return () => {
    for (const { signal, listener } of listeners) {
      process.off(signal, listener);
    }
  };
};
