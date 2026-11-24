// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { tokens } from "@offgrid/ui";
import { describe, expect, it } from "vitest";
import { filesLayoutStyle } from "./styles.js";

describe("filesLayoutStyle", () => {
  it("gives the aside the drive switcher width when no file is selected", () => {
    expect(filesLayoutStyle(false, false).gridTemplateColumns).toBe("minmax(0, 1fr) 20rem");
  });

  it("gives the aside the details panel width while a file is selected", () => {
    expect(filesLayoutStyle(false, true).gridTemplateColumns).toBe(
      `minmax(0, 1fr) ${tokens.size.detailsPanel}`,
    );
  });

  it("has no aside column on a narrow screen", () => {
    expect(filesLayoutStyle(true, true).gridTemplateColumns).toBe("minmax(0, 1fr)");
  });

  it("narrows the gap while the details panel takes the aside", () => {
    expect(filesLayoutStyle(false, true).gap).toBe(tokens.space[5]);
    expect(filesLayoutStyle(false, false).gap).toBe(tokens.space[6]);
  });
});
