// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isSelfLink } from "./is-self-link.js";

const ID = "5f0c2a7e-1d2b-4c3d-8e9f-0a1b2c3d4e5f";
const OTHER_ID = "6a1d3b8f-2e3c-4d4e-9f0a-1b2c3d4e5f60";

describe("isSelfLink", () => {
  it("is true when both ends name the same event", () => {
    expect(
      isSelfLink(
        { entityType: "calendar-event", entityId: ID },
        { entityType: "calendar-event", entityId: ID },
      ),
    ).toBe(true);
  });

  it("is false when the events differ", () => {
    expect(
      isSelfLink(
        { entityType: "calendar-event", entityId: ID },
        { entityType: "calendar-event", entityId: OTHER_ID },
      ),
    ).toBe(false);
  });
});
