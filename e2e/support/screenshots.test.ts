// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { screenPath, slug } from "./screenshots.js";

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
});
