// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toPreviewKind } from "./to-preview-kind.js";

describe("toPreviewKind", () => {
  it.each(["image/png", "image/jpeg", "image/gif", "image/webp"])(
    "previews %s as an image",
    (mimeType) => {
      expect(toPreviewKind(mimeType)).toBe("image");
    },
  );

  it("previews a PDF as a pdf", () => {
    expect(toPreviewKind("application/pdf")).toBe("pdf");
  });

  it("ignores case, spaces and parameters of the media type", () => {
    expect(toPreviewKind(" Image/PNG ; charset=binary")).toBe("image");
  });

  it.each([
    "image/svg+xml",
    "text/html",
    "text/plain",
    "application/octet-stream",
    "constructor",
    "",
  ])("does not preview %s", (mimeType) => {
    expect(toPreviewKind(mimeType)).toBeNull();
  });
});
