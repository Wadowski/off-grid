// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { restoredName } from "./restored-name.js";

describe("restoredName", () => {
  it("keeps the name when no live sibling has it", () => {
    expect(restoredName("report.pdf", false, ["other.pdf"])).toBe("report.pdf");
  });

  it("adds (2) before the extension when the name is taken", () => {
    expect(restoredName("report.pdf", false, ["report.pdf"])).toBe("report (2).pdf");
  });

  it("adds the suffix to a folder name without an extension", () => {
    expect(restoredName("Holiday", true, ["Holiday"])).toBe("Holiday (2)");
  });

  it("treats a name without a stem before the dot as having no extension", () => {
    expect(restoredName(".env", false, [".env"])).toBe(".env (2)");
  });

  it("skips suffixes that are taken", () => {
    expect(restoredName("report.pdf", false, ["report.pdf", "report (2).pdf"])).toBe(
      "report (3).pdf",
    );
  });

  it("compares names case-insensitively", () => {
    expect(restoredName("Report.PDF", false, ["report.pdf"])).toBe("Report (2).PDF");
  });

  it("keeps the whole name within 255 characters", () => {
    const name = `${"a".repeat(250)}.pdf`;
    const restored = restoredName(name, false, [name]);

    expect(restored.length).toBeLessThanOrEqual(255);
    expect(restored.endsWith(" (2).pdf")).toBe(true);
  });
});
