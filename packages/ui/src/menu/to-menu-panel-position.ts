// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { MENU_GAP_PX, MENU_GUTTER_PX } from "./constants.js";
import type { MenuPanelSize, MenuPosition, MenuTriggerRect, MenuViewport } from "./types.js";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), Math.max(min, max));

const toLeft = (trigger: MenuTriggerRect, panel: MenuPanelSize, viewport: MenuViewport): number =>
  clamp(trigger.right - panel.width, MENU_GUTTER_PX, viewport.width - panel.width - MENU_GUTTER_PX);

const toTop = (trigger: MenuTriggerRect, panel: MenuPanelSize, viewport: MenuViewport): number => {
  const below = trigger.bottom + MENU_GAP_PX;
  const fitsBelow = below + panel.height <= viewport.height - MENU_GUTTER_PX;
  const above = trigger.top - MENU_GAP_PX - panel.height;
  const fitsAbove = above >= MENU_GUTTER_PX;
  return !fitsBelow && fitsAbove ? above : below;
};

export const toMenuPanelPosition = (
  trigger: MenuTriggerRect,
  panel: MenuPanelSize,
  viewport: MenuViewport,
): MenuPosition => ({
  top: toTop(trigger, panel, viewport),
  left: toLeft(trigger, panel, viewport),
});
