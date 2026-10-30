// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { DeliveryLoopState, OnNotification } from "./types.js";

export const wakeOnNotification =
  (state: DeliveryLoopState): OnNotification =>
  (): void =>
    state.wake?.();
