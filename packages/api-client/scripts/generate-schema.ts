// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const spdxHeader =
  "// SPDX-FileCopyrightText: 2026 Dominik Wadowski\n// SPDX-License-Identifier: FSL-1.1-ALv2\n\n";
const contractsPath = fileURLToPath(new URL("../../contracts/openapi.json", import.meta.url));
const outputPath = fileURLToPath(new URL("../src/generated/schema.ts", import.meta.url));
const checkOnly = process.argv.includes("--check");

const DOCUMENTATION_KEYS = new Set(["description", "format", "summary"]);

const withoutDocumentation = (node: unknown): unknown => {
  if (Array.isArray(node)) {
    return node.map(withoutDocumentation);
  }
  if (node === null || typeof node !== "object") {
    return node;
  }
  return Object.fromEntries(
    Object.entries(node)
      .filter(([key, value]) => !(DOCUMENTATION_KEYS.has(key) && typeof value === "string"))
      .map(([key, value]) => [key, withoutDocumentation(value)]),
  );
};

const openapi = withoutDocumentation(JSON.parse(await readFile(contractsPath, "utf8")));
const TYPE_ANNOTATION_LINE = /^[ \t]*\/\*\* @(enum \{string\}|constant) \*\/\n/gm;

const generatedBody = astToString(await openapiTS(openapi as Parameters<typeof openapiTS>[0]));
const generated = `${spdxHeader}${generatedBody.replace(TYPE_ANNOTATION_LINE, "")}`;

if (checkOnly) {
  const committed = await readFile(outputPath, "utf8");
  if (committed !== generated) {
    console.error("packages/api-client/src/generated/schema.ts is stale. Run pnpm gen:api.");
    process.exit(1);
  }
} else {
  await writeFile(outputPath, generated);
}
