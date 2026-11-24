// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { KeyboardEvent, RefObject } from "react";
import { toNextMenuIndex } from "./to-next-menu-index.js";

const MENU_ITEM_SELECTOR = '[role="menuitem"]';

export const toMenuKeyDown =
  (panelRef: RefObject<HTMLDivElement | null>, close: (restoreFocus: boolean) => void) =>
  (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      close(true);
      return;
    }
    const items = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [],
    );
    const nextIndex = toNextMenuIndex(
      event.key,
      items.indexOf(document.activeElement as HTMLElement),
      items.length,
    );
    if (nextIndex === null) {
      return;
    }
    event.preventDefault();
    items[nextIndex]?.focus();
  };
