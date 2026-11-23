// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toDriveControlText } from "./to-drive-control-text.js";

describe("toDriveControlText", () => {
  it("shows the loading text while the drives are requested", () => {
    expect(toDriveControlText("loading", "Personal")).toEqual({
      kind: "text",
      textId: "files.topBar.driveLoading",
    });
  });

  it("shows the generic drives label when no active drive is resolved", () => {
    expect(toDriveControlText("ready", null)).toEqual({
      kind: "text",
      textId: "files.topBar.driveUnknown",
    });
  });

  it("shows the drive name once the active drive is known", () => {
    expect(toDriveControlText("ready", "Home")).toEqual({ kind: "name", name: "Home" });
  });

  it("shows the generic drives label when the drives failed to load", () => {
    expect(toDriveControlText("failed", null)).toEqual({
      kind: "text",
      textId: "files.topBar.driveUnknown",
    });
  });
});
