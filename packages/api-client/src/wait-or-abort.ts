// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const waitOrAbort = (ms: number, signal: AbortSignal): Promise<boolean> =>
  new Promise<boolean>((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }
    const settle = (completed: boolean) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      resolve(completed);
    };
    const timer = setTimeout(settle, ms, true);
    const abort = () => settle(false);
    signal.addEventListener("abort", abort, { once: true });
  });
