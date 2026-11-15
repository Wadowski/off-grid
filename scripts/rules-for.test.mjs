// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { loadRules, renderRules, rulesFor } from "./rules-for.mjs";

const fixture = () => {
  const root = mkdtempSync(join(tmpdir(), "rules-for-"));
  mkdirSync(join(root, ".claude/rules"), { recursive: true });
  writeFileSync(
    join(root, ".claude/rules/web.md"),
    '---\npaths:\n  - "apps/main-web/**"\n---\n\n# Web\n\n- DO use tokens. [lint]\n- DO keep it small.\n',
  );
  writeFileSync(
    join(root, ".claude/rules/mod.md"),
    '---\npaths:\n  - "modules/**"\n---\n\n- DO use events.\n',
  );
  return root;
};

test("rulesFor selects rules whose paths match a changed file", () => {
  const rules = loadRules(fixture());
  const matched = rulesFor(rules, ["apps/main-web/src/a.tsx"]);
  assert.deepEqual(
    matched.map((rule) => rule.file),
    [".claude/rules/web.md"],
  );
});

test("renderRules can drop [lint] bullets for reviewers", () => {
  const matched = rulesFor(loadRules(fixture()), ["apps/main-web/src/a.tsx"]);
  assert.match(renderRules(matched), /use tokens/);
  assert.doesNotMatch(renderRules(matched, { reviewOnly: true }), /use tokens/);
  assert.match(renderRules(matched, { reviewOnly: true }), /keep it small/);
});
