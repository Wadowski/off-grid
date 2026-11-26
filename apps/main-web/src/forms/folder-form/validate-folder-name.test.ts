// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { validateFolderName } from "./validate-folder-name.js";

describe("validateFolderName", () => {
  it.each(["", "   ", "\t"])("requires a name for %j", (name) => {
    expect(validateFolderName(name)).toBe("nameRequired");
  });

  it("accepts a name of 255 characters and refuses 256", () => {
    expect(validateFolderName("a".repeat(255))).toBeUndefined();
    expect(validateFolderName("a".repeat(256))).toBe("nameTooLong");
  });

  it("counts the length after trimming the surrounding spaces", () => {
    expect(validateFolderName(` ${"a".repeat(255)} `)).toBeUndefined();
  });

  it.each(["Work/2026", "Work\\2026", "Bad\u0000name", ".", ".."])(
    "refuses the name %j",
    (name) => {
      expect(validateFolderName(name)).toBe("nameInvalid");
    },
  );

  it.each(["Holiday", "Zdjęcia 2026", "Ünïcode 📷", "...dots"])("accepts the name %j", (name) => {
    expect(validateFolderName(name)).toBeUndefined();
  });
});
