// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { filterForOption } from "./filter-for-option.js";

describe("filterForOption", () => {
  it("maps each chip to the inbox filters it stands for", () => {
    expect(filterForOption("all")).toEqual({ unread: false });
    expect(filterForOption("unread")).toEqual({ unread: true });
    expect(filterForOption("calendar")).toEqual({ category: "calendar", unread: false });
    expect(filterForOption("account-security")).toEqual({
      category: "account-security",
      unread: false,
    });
  });
});
