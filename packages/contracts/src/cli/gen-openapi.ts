// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { renderOpenApi } from "../render-open-api.js";

const target = fileURLToPath(new URL("../../openapi.json", import.meta.url));
writeFileSync(target, renderOpenApi());
console.log(`Wrote ${target}`);
