// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveBlobAsFile } from "./save-blob-as-file.js";

const OBJECT_URL = "blob:http://localhost/saved";

beforeEach(() => {
  vi.useFakeTimers();
  URL.createObjectURL = vi.fn(() => OBJECT_URL);
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("saveBlobAsFile", () => {
  it("clicks a temporary link that downloads the blob under the file name", () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe("Notes.txt");
      expect(this.href).toBe(OBJECT_URL);
    });
    const blob = new Blob(["hello"]);

    saveBlobAsFile(blob, "Notes.txt");

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector("a[download]")).toBeNull();
  });

  it("revokes the object URL once the click is done", () => {
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    saveBlobAsFile(new Blob(["hello"]), "Notes.txt");
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith(OBJECT_URL);
  });
});
