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

const openapi = JSON.parse(await readFile(contractsPath, "utf8"));
const generated = `${spdxHeader}${astToString(await openapiTS(openapi))}`;

if (checkOnly) {
  const committed = await readFile(outputPath, "utf8");
  if (committed !== generated) {
    console.error("packages/api-client/src/generated/schema.ts is stale. Run pnpm gen:api.");
    process.exit(1);
  }
} else {
  await writeFile(outputPath, generated);
}
