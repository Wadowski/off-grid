// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { withNotificationQuery } from "./with-notification-query.js";

const PATH = "/me/notifications";

describe("withNotificationQuery", () => {
  it("leaves the path alone when no option is set", () => {
    expect(withNotificationQuery(PATH, {})).toBe(PATH);
  });

  it("omits options that are undefined", () => {
    expect(
      withNotificationQuery(PATH, {
        cursor: undefined,
        limit: undefined,
        category: undefined,
        unread: undefined,
      }),
    ).toBe(PATH);
  });

  it("adds each option as its own query parameter", () => {
    expect(withNotificationQuery(PATH, { cursor: "abc" })).toBe(`${PATH}?cursor=abc`);
    expect(withNotificationQuery(PATH, { limit: 20 })).toBe(`${PATH}?limit=20`);
    expect(withNotificationQuery(PATH, { category: "calendar" })).toBe(`${PATH}?category=calendar`);
    expect(withNotificationQuery(PATH, { unread: "true" })).toBe(`${PATH}?unread=true`);
  });

  it("adds all options in a fixed order", () => {
    expect(
      withNotificationQuery(PATH, {
        unread: "true",
        category: "account-security",
        limit: 5,
        cursor: "next",
      }),
    ).toBe(`${PATH}?cursor=next&limit=5&category=account-security&unread=true`);
  });

  it("URL-encodes the cursor", () => {
    expect(withNotificationQuery(PATH, { cursor: "a+b c&d" })).toBe(`${PATH}?cursor=a%2Bb+c%26d`);
  });
});
