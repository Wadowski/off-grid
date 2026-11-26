// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { isFilesDrag } from "./is-files-drag.js";

const dataTransferWith = (types: readonly string[]) => ({ types }) as unknown as DataTransfer;

describe("isFilesDrag", () => {
  it("recognises a drag that carries files", () => {
    expect(isFilesDrag(dataTransferWith(["text/plain", "Files"]))).toBe(true);
  });

  it("ignores a drag of text or a link", () => {
    expect(isFilesDrag(dataTransferWith(["text/plain", "text/uri-list"]))).toBe(false);
  });

  it("ignores an event without a data transfer", () => {
    expect(isFilesDrag(null)).toBe(false);
  });
});
