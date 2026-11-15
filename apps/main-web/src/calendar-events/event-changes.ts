// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

type Listener = () => void;

const listeners = new Set<Listener>();

export const notifyEventsChanged = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

export const subscribeEventsChanged = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
