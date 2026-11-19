// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent } from "react";

export const handleActivateKeyDown = (
  activate: () => void,
  event: KeyboardEvent<HTMLElement>,
): void => {
  if (event.key === "Enter") {
    activate();
    return;
  }
  if (event.key === " ") {
    event.preventDefault();
    activate();
  }
};
