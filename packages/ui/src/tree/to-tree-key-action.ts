// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { toArrowLeftAction } from "./to-arrow-left-action.js";
import { toArrowRightAction } from "./to-arrow-right-action.js";
import { toStepFocusAction } from "./to-step-focus-action.js";
import type { TreeKeyAction, TreeKeyContext } from "./types.js";

export const toTreeKeyAction = (key: string, context: TreeKeyContext): TreeKeyAction | null => {
  const current = context.visible[context.index];
  if (current === undefined) {
    return null;
  }
  switch (key) {
    case "ArrowDown":
      return toStepFocusAction(context, "next");
    case "ArrowUp":
      return toStepFocusAction(context, "previous");
    case "Home":
      return toStepFocusAction(context, "first");
    case "End":
      return toStepFocusAction(context, "last");
    case "ArrowRight":
      return toArrowRightAction(context);
    case "ArrowLeft":
      return toArrowLeftAction(context);
    case "Enter":
    case " ":
      return current.node.disabled ? null : { type: "select", id: current.node.id };
    default:
      return null;
  }
};
