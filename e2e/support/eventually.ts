// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export type EventuallyOptions = {
  timeout?: number;
  interval?: number;
};

export async function eventually<T>(
  assertion: () => T | Promise<T>,
  { timeout = 5_000, interval = 100 }: EventuallyOptions = {},
): Promise<T> {
  const deadline = Date.now() + timeout;
  for (;;) {
    try {
      return await assertion();
    } catch (error) {
      if (Date.now() >= deadline) {
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
