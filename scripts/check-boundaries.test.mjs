// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CRUISER = fileURLToPath(
  new URL("../node_modules/dependency-cruiser/bin/dependency-cruiser.mjs", import.meta.url),
);
const CONFIG = ".dependency-cruiser.cjs";
const FIXTURES = "tools/boundary-fixtures";
const REAL_TREE = ["apps", "modules", "packages"];
const ADR = "docs/adr/0006-modular-monolith.md";

const RULES = [
  "module-public-api",
  "identity-internals-private",
  "modules-not-import-apps",
  "packages-not-import-apps-or-modules",
  "web-allowed-imports",
  "domain-no-io",
  "domain-no-adapter-layers",
  "no-circular",
];

function cruise(targets, outputType) {
  const result = spawnSync(
    process.execPath,
    [CRUISER, "--config", CONFIG, "--output-type", outputType, ...targets],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  return result;
}

describe("check:boundaries on the real tree", () => {
  it("passes", () => {
    const result = cruise(REAL_TREE, "err-long");
    assert.equal(result.status, 0, result.stdout + result.stderr);
  });
});

describe("check:boundaries on the fixtures", () => {
  const { summary } = JSON.parse(cruise([FIXTURES], "json").stdout);
  const { violations } = summary;

  for (const rule of RULES) {
    it(`${rule} fails on its own fixture`, () => {
      const hits = violations.filter(
        (violation) => violation.rule.name === rule && violation.rule.severity === "error",
      );
      const fromFixture = hits.filter((violation) =>
        violation.from.startsWith(`${FIXTURES}/${rule}/`),
      );
      assert.ok(fromFixture.length > 0, `expected ${rule} to fail on ${FIXTURES}/${rule}/`);
    });
  }

  it("the legal imports in the allowed fixture pass", () => {
    const allowed = violations.filter((violation) =>
      violation.from.startsWith(`${FIXTURES}/allowed/`),
    );
    assert.deepEqual(allowed, []);
  });

  it("violation messages name the rule and point to the modular monolith ADR", () => {
    const text = cruise([FIXTURES], "err-long").stdout;
    for (const rule of RULES) {
      assert.match(text, new RegExp(`error ${rule}:`));
    }
    assert.ok(text.includes(ADR), `expected the output to reference ${ADR}`);
  });
});
