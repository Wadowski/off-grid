// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { downloadFileVersion } from "./download-file-version.js";
import { getFileVersionContent } from "./files-api.js";

vi.mock("./files-api.js", () => ({ getFileVersionContent: vi.fn() }));

const FILE_ID = "00000000-0000-4000-8000-0000000000aa";
const VERSION_ID = "00000000-0000-4000-8000-0000000000bb";

describe("downloadFileVersion", () => {
  let clicked: HTMLAnchorElement[];

  beforeEach(() => {
    clicked = [];
    URL.createObjectURL = vi.fn(() => "blob:version");
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.mocked(getFileVersionContent).mockReset();
  });

  it("saves the version content under the file name", async () => {
    const content = new Blob(["first draft"]);
    vi.mocked(getFileVersionContent).mockResolvedValue(content);

    await downloadFileVersion(FILE_ID, VERSION_ID, "Notes.txt");

    expect(getFileVersionContent).toHaveBeenCalledWith(FILE_ID, VERSION_ID);
    expect(URL.createObjectURL).toHaveBeenCalledWith(content);
    expect(clicked[0]).toMatchObject({ href: "blob:version", download: "Notes.txt" });
  });
});
