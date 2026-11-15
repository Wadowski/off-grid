// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isScreenUrl, screenNameFor, screenPath, slug } from "./screenshots.js";

describe("screenshots", () => {
  it("turns titles into file-safe slugs", () => {
    expect(slug("First person sets up the server!")).toBe("first-person-sets-up-the-server");
    expect(slug("???")).toBe("screen");
  });

  it("groups screens by feature", () => {
    expect(screenPath("Create account screen", "Weak password")).toMatch(
      /create-account-screen\/weak-password\.png$/,
    );
  });

  it("names a screen by its route without the query", () => {
    expect(screenNameFor("http://127.0.0.1:3000/calendar/day?date=2026-03-02", [])).toBe(
      "/calendar/day",
    );
  });

  it("gives one key to a record page for every record", () => {
    expect(
      screenNameFor("http://127.0.0.1:3000/calendar/26a199db-f2c6-4cd4-bdf2-efcd71d7a30f", []),
    ).toBe(
      screenNameFor("http://127.0.0.1:3000/calendar/4888a260-2993-47fb-9aa7-853a975fd735", []),
    );
    expect(
      screenNameFor("http://127.0.0.1:3000/calendar/26a199db-f2c6-4cd4-bdf2-efcd71d7a30f", []),
    ).toBe("/calendar/:id");
  });

  it("skips a page that never navigated", () => {
    expect(isScreenUrl("about:blank")).toBe(false);
    expect(isScreenUrl("http://127.0.0.1:5173/calendar/day")).toBe(true);
  });

  it("gives one name to one route with different dates", () => {
    expect(screenNameFor("http://127.0.0.1:3000/calendar/day?date=2026-03-03", ["@ui"])).toBe(
      screenNameFor("http://127.0.0.1:3000/calendar/day?date=2026-03-02", []),
    );
  });

  it("lets a @screen tag override the route", () => {
    expect(
      screenNameFor("http://127.0.0.1:3000/sign-in?error=1", ["@ui", "@screen:sign-in error"]),
    ).toBe("sign-in error");
    expect(screenNameFor("http://127.0.0.1:3000/sign-in", ["@screen:sign-in error"])).not.toBe(
      screenNameFor("http://127.0.0.1:3000/sign-in", []),
    );
  });

  it("keeps theme and width in the file path", () => {
    const feature = "Calendar views";
    const paths = [
      screenPath(feature, "/calendar/day"),
      screenPath(feature, "/calendar/day mobile"),
      screenPath(feature, "/calendar/day dark"),
      screenPath(feature, "/calendar/day dark mobile"),
    ];
    expect(new Set(paths).size).toBe(4);
    expect(paths[3]).toMatch(/calendar-views\/calendar-day-dark-mobile\.png$/);
  });
});
