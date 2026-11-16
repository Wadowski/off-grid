// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { planSpecs } from "./e2e-changed.mjs";

const everyFileExists = () => true;

test("planSpecs maps each changed feature to its generated spec and ignores other files", () => {
  const plan = planSpecs(
    ["e2e/features/calendar/day.feature", "apps/main-web/src/a.ts", "e2e/steps/x.ts"],
    { featureExists: everyFileExists, specExists: everyFileExists },
  );
  assert.deepEqual(plan, {
    args: ["e2e/\\.features-gen/calendar/day\\.feature\\.spec\\.js"],
    missing: [],
  });
});

test("planSpecs escapes nested paths and regex metacharacters in feature names", () => {
  const plan = planSpecs(["e2e/features/family/plan (v2)+1.feature"], {
    featureExists: everyFileExists,
    specExists: everyFileExists,
  });
  assert.deepEqual(plan.args, [
    "e2e/\\.features-gen/family/plan \\(v2\\)\\+1\\.feature\\.spec\\.js",
  ]);
});

test("planSpecs reports a changed feature whose generated spec is missing", () => {
  const plan = planSpecs(["e2e/features/calendar/day.feature"], {
    featureExists: everyFileExists,
    specExists: () => false,
  });
  assert.deepEqual(plan.missing, ["e2e/features/calendar/day.feature"]);
});

test("planSpecs skips a changed feature that no longer exists on disk", () => {
  const plan = planSpecs(["e2e/features/calendar/gone.feature"], {
    featureExists: () => false,
    specExists: () => false,
  });
  assert.deepEqual(plan, { args: [], missing: [] });
});
