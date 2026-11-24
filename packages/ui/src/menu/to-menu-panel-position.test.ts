// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toMenuPanelPosition } from "./to-menu-panel-position.js";

const viewport = { width: 400, height: 600 };
const panel = { width: 180, height: 120 };

describe("toMenuPanelPosition", () => {
  it("opens below the trigger and aligns the panel right edge with the trigger", () => {
    const position = toMenuPanelPosition({ top: 100, bottom: 130, right: 300 }, panel, viewport);

    expect(position).toEqual({ top: 134, left: 120 });
  });

  it("opens above the trigger when there is no room below it", () => {
    const position = toMenuPanelPosition({ top: 520, bottom: 550, right: 300 }, panel, viewport);

    expect(position).toEqual({ top: 396, left: 120 });
  });

  it("keeps the panel inside the left edge of the viewport", () => {
    const position = toMenuPanelPosition({ top: 100, bottom: 130, right: 60 }, panel, viewport);

    expect(position.left).toBe(8);
  });

  it("keeps the panel inside the right edge of the viewport", () => {
    const position = toMenuPanelPosition({ top: 100, bottom: 130, right: 399 }, panel, viewport);

    expect(position.left).toBe(212);
  });
});
