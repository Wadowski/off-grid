// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import {
  bringUpStack,
  newComposeProjectName,
  targetBaseUrl,
  tearDownStack,
  waitForReady,
} from "./stack.js";

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (process.env.E2E_REUSE_STACK === "1") {
    return async () => {};
  }

  const project = newComposeProjectName();
  process.env.E2E_COMPOSE_PROJECT = project;

  try {
    await bringUpStack(project);
    await waitForReady(targetBaseUrl());
  } catch (error) {
    await tearDownStack(project);
    throw error;
  }

  return async () => {
    await tearDownStack(project);
    delete process.env.E2E_COMPOSE_PROJECT;
  };
}
