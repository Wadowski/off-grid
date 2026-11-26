// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { TreeKeyAction, TreeKeyContext } from "./types.js";

export const toStepFocusAction = (
  context: TreeKeyContext,
  step: "previous" | "next" | "first" | "last",
): TreeKeyAction | null => {
  const lastIndex = context.visible.length - 1;
  const targetIndex = {
    previous: context.index - 1,
    next: context.index + 1,
    first: 0,
    last: lastIndex,
  }[step];
  const target = context.visible[targetIndex];
  if (target === undefined || targetIndex < 0 || targetIndex > lastIndex) {
    return null;
  }
  return { type: "focus", id: target.node.id };
};
