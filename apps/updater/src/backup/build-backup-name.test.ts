// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { buildBackupName } from "./build-backup-name.js";
import { parseBackupName } from "./parse-backup-name.js";

describe("buildBackupName", () => {
  it("names a backup by version and UTC timestamp", () => {
    const name = buildBackupName("1.4.0", new Date("2026-11-17T19:45:00.000Z"));

    expect(name).toBe("offgrid-1.4.0-20261117T194500Z");
  });

  it("round-trips through parseBackupName", () => {
    const name = buildBackupName("1.4.0-rc.1", new Date("2026-11-17T19:45:00.000Z"));

    expect(parseBackupName(name)).toEqual({
      name,
      version: "1.4.0-rc.1",
      stamp: "20261117T194500Z",
    });
  });

  it("rejects a version that cannot be part of a backup name", () => {
    expect(() => buildBackupName("1.4.0/../x", new Date("2026-11-17T19:45:00.000Z"))).toThrow(
      "backup version contains characters that cannot be part of a backup name",
    );
  });
});
