// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORKFLOW = readFileSync(join(ROOT, ".github", "workflows", "release.yml"), "utf8");
const EXACT_VERSION_TAG = /^v\d+\.\d+\.\d+$/;
const ACTION_REFERENCE = /uses:\s*\S+@(\S+)/g;
const LATEST_TAG = /latest(?!=false)/;

const topLevelBlock = (key) => {
  const match = new RegExp(`^${key}:\\n((?:[ \\t]+.*\\n?|\\n)*)`, "m").exec(WORKFLOW);
  return match
    ? match[1]
        .trim()
        .split("\n")
        .map((line) => line.trim())
    : [];
};

describe("release workflow", () => {
  it("runs only for version tags", () => {
    assert.deepEqual(topLevelBlock("on"), ["push:", "tags:", '- "v[0-9]+.[0-9]+.[0-9]+"']);
    assert.doesNotMatch(WORKFLOW, /pull_request|branches:/);
  });

  it("grants exactly contents and packages write", () => {
    assert.deepEqual(topLevelBlock("permissions"), ["contents: write", "packages: write"]);
  });

  it("pins every third-party action to an exact version tag", () => {
    const references = [...WORKFLOW.matchAll(ACTION_REFERENCE)].map((match) => match[1]);
    assert.ok(references.length > 0);
    for (const reference of references) {
      assert.match(reference, EXACT_VERSION_TAG);
    }
  });

  it("never pushes a latest tag", () => {
    const tagLines = WORKFLOW.split("\n").filter((line) => /tags:|type=/.test(line));
    for (const line of tagLines) {
      assert.doesNotMatch(line, LATEST_TAG);
    }
  });
});
