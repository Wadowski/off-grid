// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { describe, expect, it } from "vitest";
import { selectBackupsToPrune } from "./select-backups-to-prune.js";
import type { ParsedBackupName } from "../types.js";

const backup = (version: string, stamp: string): ParsedBackupName => ({
  name: `offgrid-${version}-${stamp}`,
  version,
  stamp,
});

const oldest = backup("1.3.0", "20261101T000000Z");
const middle = backup("1.3.1", "20261110T000000Z");
const newest = backup("1.4.0", "20261117T194500Z");

describe("selectBackupsToPrune", () => {
  it("keeps the newest N backups by timestamp in the name", () => {
    const pruned = selectBackupsToPrune([middle, newest, oldest], 2, newest.name);

    expect(pruned).toEqual([oldest]);
  });

  it("orders by the name timestamp, not the order given", () => {
    const pruned = selectBackupsToPrune([oldest, newest, middle], 1, newest.name);

    expect(pruned.map((backup) => backup.name)).toEqual([middle.name, oldest.name]);
  });

  it("prunes nothing when the retention is larger than the count", () => {
    expect(selectBackupsToPrune([oldest, newest], 3, newest.name)).toEqual([]);
  });

  it("never selects the kept backup even when it is older than the retained set", () => {
    const pruned = selectBackupsToPrune([oldest, middle, newest], 1, oldest.name);

    expect(pruned.map((backup) => backup.name)).toEqual([middle.name]);
  });
});
