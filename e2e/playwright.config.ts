// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { defineConfig, devices } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { targetBaseUrl } from "./support/stack.js";

const SYSTEM_UPDATE_TIMEOUT_MS = 600_000;

const SYSTEM_UPDATE_SPECS = /system\/(install|system-update)\.feature\.spec\.js$/;

const testDir = defineBddConfig({
  featuresRoot: "features",
  features: [
    "features/**/*.feature",
    "!features/system/install.feature",
    "!features/system/system-update.feature",
    "!features/notifications/inbox-surfaces.feature",
  ],
  steps: ["steps/**/*.ts", "support/fixtures.ts"],
});

export default defineConfig({
  testDir,
  globalSetup: "./support/global-setup.ts",
  fullyParallel: true,
  workers: 1,
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
      testIgnore: SYSTEM_UPDATE_SPECS,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "system-update",
      testMatch: SYSTEM_UPDATE_SPECS,
      dependencies: ["chromium"],
      fullyParallel: false,
      timeout: SYSTEM_UPDATE_TIMEOUT_MS,
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
