// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { request } from "@playwright/test";
import { provisionRunAdmin } from "./factories/instance-admin.js";
import { startReleaseSource } from "./release-source/start-release-source.js";
import {
  assertPortsFree,
  bringUpStack,
  e2ePortChecks,
  newComposeProjectName,
  stopLeftoverRunStacks,
  targetBaseUrl,
  tearDownStack,
  waitForReady,
} from "./stack.js";

async function provisionOnRunningStack(): Promise<void> {
  await waitForReady(targetBaseUrl());
  const api = await request.newContext({ baseURL: targetBaseUrl() });
  try {
    await provisionRunAdmin(api);
  } finally {
    await api.dispose();
  }
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (process.env.E2E_REUSE_STACK === "1") {
    const releaseSource = await startReleaseSource();
    await provisionOnRunningStack();
    return releaseSource.close;
  }

  await stopLeftoverRunStacks();
  await assertPortsFree(e2ePortChecks());
  const releaseSource = await startReleaseSource();

  const project = newComposeProjectName();
  process.env.E2E_COMPOSE_PROJECT = project;

  try {
    await bringUpStack(project);
    await provisionOnRunningStack();
  } catch (error) {
    await tearDownStack(project);
    await releaseSource.close();
    throw error;
  }

  return async () => {
    await tearDownStack(project);
    await releaseSource.close();
    delete process.env.E2E_COMPOSE_PROJECT;
  };
}
