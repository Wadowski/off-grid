// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { surfaceForViewport } from "./surface-for-viewport.js";

describe("surfaceForViewport", () => {
  it("opens the popover on wide viewports and the modal on narrow ones", () => {
    expect(surfaceForViewport(false)).toBe("popover");
    expect(surfaceForViewport(true)).toBe("modal");
  });
});
