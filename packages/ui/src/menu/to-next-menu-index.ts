// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { MenuKey } from "./types.js";

const isMenuKey = (key: string): key is MenuKey =>
  key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End";

export const toNextMenuIndex = (key: string, current: number, count: number): number | null => {
  if (count === 0 || !isMenuKey(key)) {
    return null;
  }
  switch (key) {
    case "ArrowDown":
      return current < 0 ? 0 : (current + 1) % count;
    case "ArrowUp":
      return current < 0 ? count - 1 : (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
  }
};
