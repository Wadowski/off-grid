// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { kindOfMimeFamily } from "./kind-of-mime-family.js";

describe("kindOfMimeFamily", () => {
  it.each([
    ["image/webp", "image"],
    ["audio/ogg", "audio"],
    ["video/mp4", "video"],
  ])("maps  to ", (type, kind) => {
    expect(kindOfMimeFamily(type)).toBe(kind);
  });

  it("returns undefined for an unknown family", () => {
    expect(kindOfMimeFamily("application/x-unknown")).toBeUndefined();
  });
});
