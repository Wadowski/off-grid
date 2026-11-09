// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createRequire } from "node:module";
import type { Page } from "@playwright/test";

const require = createRequire(import.meta.url);
const AXE_SOURCE_PATH = require.resolve("axe-core/axe.min.js");
const BLOCKING_IMPACTS = ["serious", "critical"];
const RUN_AXE_SCRIPT = "(async () => (await window.axe.run(document)).violations)()";

type AxeViolation = {
  id: string;
  impact?: string | null;
  help: string;
  nodes: { target: string[] }[];
};

export const blockingViolationDescriptions = async (page: Page): Promise<string[]> => {
  await page.addScriptTag({ path: AXE_SOURCE_PATH });
  const violations = (await page.evaluate(RUN_AXE_SCRIPT)) as AxeViolation[];
  return violations
    .filter((violation) => BLOCKING_IMPACTS.includes(violation.impact ?? ""))
    .map(
      (violation) =>
        `${violation.id}: ${violation.help} @ ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`,
    );
};
