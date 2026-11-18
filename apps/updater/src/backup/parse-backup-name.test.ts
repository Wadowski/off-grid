// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { parseBackupName } from "./parse-backup-name.js";

describe("parseBackupName", () => {
  it.each([
    "lost+found",
    "offgrid-1.4.0",
    "offgrid-1.4.0-2026-11-17",
    "backup-1.4.0-20261117T194500Z",
    "offgrid-1.4.0-20261117T194500",
    "offgrid-1.4.0-20261117T194500Z-extra",
    "offgrid-../../etc-20261117T194500Z",
  ])("rejects the foreign folder name %s", (name) => {
    expect(parseBackupName(name)).toBeUndefined();
  });
});
