// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import "@testing-library/jest-dom/vitest";

if (typeof HTMLElement.prototype.showPopover !== "function") {
  HTMLElement.prototype.showPopover = function showPopover(this: HTMLElement) {
    this.setAttribute("data-popover-open", "");
    this.style.display = "block";
  };
  HTMLElement.prototype.hidePopover = function hidePopover(this: HTMLElement) {
    this.removeAttribute("data-popover-open");
    this.style.display = "none";
  };
}
