// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { guestChanges } from "./guest-changes.js";

describe("guestChanges", () => {
  it("lists the guests to invite and to remove", () => {
    expect(guestChanges(["ben", "cara"], ["cara", "dan"])).toEqual({
      toInvite: ["dan"],
      toRemove: ["ben"],
    });
  });

  it("reports no changes when the guests are the same", () => {
    expect(guestChanges(["ben"], ["ben"])).toEqual({ toInvite: [], toRemove: [] });
  });
});
