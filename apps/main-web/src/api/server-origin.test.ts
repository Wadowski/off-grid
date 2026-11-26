// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { serverOrigin } from "./server-origin.js";

describe("serverOrigin", () => {
  it("keeps API requests on the page's own origin when no build origin is set", () => {
    expect(serverOrigin()).toBe("");
  });
});
