// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { targetBaseUrl } from "./support/stack.js";

const testDir = defineBddConfig({
  featuresRoot: "features",
  features: "features/**/*.feature",
  steps: ["steps/**/*.ts", "support/fixtures.ts"],
});

export default defineConfig({
  testDir,
  globalSetup: "./support/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  outputDir: "artifacts/test-results",
  reporter: [
    ["list"],
    ...(process.env.CI
      ? [["html", { open: "never", outputFolder: "artifacts/report" }] as const]
      : []),
    ["./support/failure-artifacts.ts"],
  ],
  use: {
    baseURL: targetBaseUrl(),
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
