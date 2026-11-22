// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { HTMLAttributes } from "react";
import { onActivateKeyDown } from "./on-activate-key-down.js";

export const activatableProps = (
  onActivate: (() => void) | undefined,
): HTMLAttributes<HTMLDivElement> => {
  if (onActivate === undefined) {
    return {};
  }
  return {
    role: "button",
    tabIndex: 0,
    className: "og-focusable",
    onClick: onActivate,
    onKeyDown: (event) => onActivateKeyDown(onActivate, event),
  };
};
