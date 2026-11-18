// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

const POLL_TIMEOUT_MILLISECONDS = 5000;

export const waitUntil = async (
  condition: () => boolean | Promise<boolean>,
  timeoutMilliseconds = POLL_TIMEOUT_MILLISECONDS,
): Promise<void> => {
  const deadline = Date.now() + timeoutMilliseconds;
  while (!(await condition())) {
    if (Date.now() > deadline) {
      throw new Error("condition not met before the timeout");
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
};
