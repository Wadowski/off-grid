// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { featureArgs } from "./e2e-changed.mjs";

test("featureArgs keeps only changed feature files, relative to e2e", () => {
  const args = featureArgs([
    "e2e/features/calendar/day.feature",
    "apps/main-web/src/a.ts",
    "e2e/steps/x.ts",
  ]);
  assert.deepEqual(args, ["features/calendar/day\\.feature"]);
});
