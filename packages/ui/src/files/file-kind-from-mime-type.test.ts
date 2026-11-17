// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { MIME_TYPE_KINDS } from "./constants.js";
import { fileKindFromMimeType } from "./file-kind-from-mime-type.js";

describe("fileKindFromMimeType", () => {
  it.each(Object.entries(MIME_TYPE_KINDS))("maps %s to %s", (mimeType, kind) => {
    expect(fileKindFromMimeType(mimeType, false)).toBe(kind);
  });

  it.each([
    ["image/png", "image"],
    ["image/svg+xml", "image"],
    ["audio/mpeg", "audio"],
    ["video/mp4", "video"],
  ])("maps the media family %s to %s", (mimeType, kind) => {
    expect(fileKindFromMimeType(mimeType, false)).toBe(kind);
  });

  it("ignores case, spaces and parameters", () => {
    expect(fileKindFromMimeType("  Image/PNG; foo=bar", false)).toBe("image");
    expect(fileKindFromMimeType("TEXT/Plain;charset=utf-8", false)).toBe("document");
  });

  it("reads the folder flag before the media type", () => {
    expect(fileKindFromMimeType("image/png", true)).toBe("folder");
    expect(fileKindFromMimeType("", true)).toBe("folder");
  });

  it("reads the directory media type as a folder", () => {
    expect(fileKindFromMimeType("inode/directory", false)).toBe("folder");
  });

  it.each(["application/octet-stream", "", "   ", "not a type", "imagepng", ";image/png"])(
    "treats %j as a generic file",
    (mimeType) => {
      expect(fileKindFromMimeType(mimeType, false)).toBe("generic");
    },
  );
});
