// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { test } from "node:test";
import { checkFile, exportedNames, findComments, findUnusedExports } from "./check-rules.mjs";

const every = (source) =>
  new Set(Array.from({ length: source.split("\n").length }, (_, index) => index + 1));

const rulesOf = (path, source) => checkFile(path, source, every(source)).map((f) => f.rule);

test("findComments reports comments and ignores strings, SPDX and shebang", () => {
  const source = [
    "#!/usr/bin/env node",
    "// SPDX-License-Identifier: FSL-1.1-ALv2",
    'const url = "http://example.test";',
    "const text = `// not a comment`;",
    "const total = 1; // trailing",
    "/* block",
    "   still block */",
    "/** @type {import('x').Y} */",
  ].join("\n");
  assert.deepEqual(findComments(source), [5, 6]);
});

test("checkFile flags function declarations on changed lines only", () => {
  const source = "export function a() {}\nexport const b = () => 1;\n";
  const findings = checkFile("src/a.ts", source, new Set([1]));
  assert.deepEqual(
    findings.map((f) => f.rule),
    ["arrow-functions"],
  );
  assert.deepEqual(checkFile("src/a.ts", source, new Set([2])), []);
});

test("checkFile flags types outside types.ts", () => {
  assert.deepEqual(rulesOf("src/a.ts", "export type A = string;"), ["types-file"]);
  assert.deepEqual(rulesOf("src/types.ts", "export type A = string;"), []);
  assert.deepEqual(rulesOf("src/a.d.ts", "interface A {}"), []);
});

test("checkFile flags fetch in the web app but not in tests", () => {
  assert.deepEqual(rulesOf("apps/main-web/src/x.ts", "await fetch(url);"), ["web-network-call"]);
  assert.deepEqual(rulesOf("apps/main-web/src/x.test.ts", "await fetch(url);"), []);
  assert.deepEqual(rulesOf("modules/a/src/x.ts", "await fetch(url);"), []);
});

test("checkFile flags colour literals outside token files", () => {
  assert.deepEqual(rulesOf("packages/ui/src/card/card.tsx", 'const c = "#fff";'), [
    "hard-coded-colour",
  ]);
  assert.deepEqual(rulesOf("packages/ui/src/light-colors.ts", 'const c = "#fff";'), []);
});

test("checkFile flags two routes in one file", () => {
  const source = 'api.get("/a", h);\napi.post("/b", h);\n';
  assert.deepEqual(rulesOf("modules/family/src/http/register-x.ts", source), [
    "one-route-per-file",
  ]);
  assert.deepEqual(rulesOf("modules/family/src/http/register-x.ts", 'api.get("/a", h);'), []);
});

test("exportedNames and findUnusedExports respect usage and entry files", () => {
  const source = "export const used = 1;\nexport async function lonely() {}\nconst local = 2;\n";
  const lines = every(source);
  assert.deepEqual(
    exportedNames(source, lines).map((e) => e.name),
    ["used", "lonely"],
  );
  const usage = (_root, name) => name === "used";
  const findings = findUnusedExports("/", "packages/x/src/a.ts", source, lines, usage);
  assert.deepEqual(
    findings.map((f) => f.message.match(/"(\w+)"/)[1]),
    ["lonely"],
  );
  assert.deepEqual(findUnusedExports("/", "packages/x/src/index.ts", source, lines, usage), []);
});
