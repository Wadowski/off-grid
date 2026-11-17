// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ActivateKeyEvent } from "./types.js";

export const onActivateKeyDown = (onActivate: () => void, event: ActivateKeyEvent): void => {
  if (event.key === "Enter") {
    onActivate();
    return;
  }
  if (event.key === " ") {
    event.preventDefault();
    onActivate();
  }
};
