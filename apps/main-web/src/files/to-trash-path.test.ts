// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { toTrashPath } from "./to-trash-path.js";
import type { Drive } from "./types.js";

describe("toTrashPath", () => {
  it("points at the trash view of the drive", () => {
    expect(toTrashPath("drive-1" as Drive["id"])).toBe("/files/drive-1/trash");
  });
});
