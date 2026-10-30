// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { eventDefinitions } from "../event-definitions.js";
import { renderOpenApi } from "../render-open-api.js";
import { canonicalJson } from "../canonical-json.js";
import { compareReleasedEvents } from "../compare-released-events.js";
import { currentEventSchemas } from "../current-event-schemas.js";
import type { EventSchemas } from "../types.js";

const update = process.argv.includes("--update");
const snapshotPath = fileURLToPath(new URL("../../released-events.json", import.meta.url));
const openApiPath = fileURLToPath(new URL("../../openapi.json", import.meta.url));

const released = JSON.parse(readFileSync(snapshotPath, "utf8")) as EventSchemas;
const current = currentEventSchemas(eventDefinitions);
const { changed, missing, added } = compareReleasedEvents(released, current);

const failures: string[] = [];
for (const name of changed) {
  failures.push(`Released event ${name} changed. Add a new version (-v2) instead.`);
}
for (const name of missing) {
  failures.push(`Released event ${name} is no longer defined. Released events cannot be removed.`);
}

if (readFileSync(openApiPath, "utf8") !== renderOpenApi()) {
  failures.push("openapi.json is stale. Run pnpm gen:openapi and commit the result.");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}

if (update && added.length > 0) {
  const next: EventSchemas = { ...released };
  for (const name of added) next[name] = current[name]!;
  const ordered = Object.fromEntries(Object.entries(next).sort(([a], [b]) => (a < b ? -1 : 1)));
  writeFileSync(snapshotPath, `${canonicalJson(ordered)}\n`);
  console.log(`Recorded ${added.length} new event(s) in released-events.json.`);
} else if (added.length > 0) {
  console.log(
    `New events not yet recorded: ${added.join(", ")}. Run with --update to record them.`,
  );
}
console.log("Contracts are compatible with the released snapshot.");
