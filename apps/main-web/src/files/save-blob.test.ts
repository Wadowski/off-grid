// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveBlob } from "./save-blob.js";

const CREATED_URL = "blob:offgrid-test";

beforeEach(() => {
  vi.useFakeTimers();
  URL.createObjectURL = vi.fn(() => CREATED_URL);
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(URL, "createObjectURL");
  Reflect.deleteProperty(URL, "revokeObjectURL");
});

describe("saveBlob", () => {
  it("saves the blob through a link named after the file and revokes the URL afterwards", () => {
    const captured: { href: string; download: string; attached: boolean }[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function click(
      this: HTMLAnchorElement,
    ) {
      captured.push({ href: this.href, download: this.download, attached: this.isConnected });
    });
    const blob = new Blob(["hello"]);

    saveBlob(blob, "Holiday.txt");

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(captured).toEqual([{ href: CREATED_URL, download: "Holiday.txt", attached: true }]);
    expect(document.querySelector("a[download]")).toBeNull();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(CREATED_URL);
  });
});
