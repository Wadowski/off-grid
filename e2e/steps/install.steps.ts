// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { createInstallHost } from "../support/install-host/create-install-host.js";
import { createOwnerData } from "../support/install-host/create-owner-data.js";
import { installedStackClient } from "../support/install-host/installed-stack-client.js";
import { installedWebUrl } from "../support/install-host/installed-web-url.js";
import { PACKAGE_MANAGER_LOG } from "../support/install-host/constants.js";
import { readHostFile } from "../support/install-host/read-host-file.js";
import { readOwnerData } from "../support/install-host/read-owner-data.js";
import { removeInstallHost } from "../support/install-host/remove-install-host.js";
import { runInstallHost } from "../support/install-host/run-install-host.js";
import { secretsFingerprint } from "../support/install-host/secrets-fingerprint.js";
import type { InstallHostKind, InstallWorld } from "../support/install-host/types.js";
import { waitForInstalledStack } from "../support/install-host/wait-for-installed-stack.js";
import { GOOD_RELEASE_VERSIONS } from "../support/release-source/constants.js";
import { ensureReleaseSource } from "../support/release-source/ensure-release-source.js";
import { setLatestVersion } from "../support/system-update/set-latest-version.js";

const { Given, When, Then, After } = createBdd(test);

const installOf = (world: ScenarioWorld): InstallWorld => {
  if (world.install === undefined) {
    throw new Error("No install host has been created in this scenario.");
  }
  return world.install;
};

const prepareHost = async (world: ScenarioWorld, kind: InstallHostKind): Promise<void> => {
  await ensureReleaseSource();
  await setLatestVersion(GOOD_RELEASE_VERSIONS[GOOD_RELEASE_VERSIONS.length - 1] ?? "");
  world.install = await createInstallHost(kind);
};

const runInstall = async (world: ScenarioWorld): Promise<void> => {
  const install = installOf(world);
  install.lastRun = await runInstallHost(install.containerName);
};

After(async ({ world }) => {
  if (world.install !== undefined) {
    await removeInstallHost(world.install);
  }
});

Given("a fresh Linux host with Docker installed", async ({ world }) => {
  await prepareHost(world, "with-docker");
});

Given("a fresh Linux host without Docker", async ({ world }) => {
  await prepareHost(world, "without-docker");
});

Given("a host that is not Linux", async ({ world }) => {
  await prepareHost(world, "not-linux");
});

Given(
  "Offgrid is installed on a host with a family named Kowalski that has a shopping list",
  async ({ world, playwright }) => {
    await prepareHost(world, "with-docker");
    await runInstall(world);
    const install = installOf(world);
    expect(install.lastRun?.exitCode, install.lastRun?.output).toBe(0);
    const api = await installedStackClient(playwright);
    try {
      await waitForInstalledStack(api);
      install.owner = await createOwnerData(api);
    } finally {
      await api.dispose();
    }
    install.secretsBefore = await secretsFingerprint(install.project);
  },
);

When("the owner runs the install script", async ({ world }) => {
  await runInstall(world);
});

When("the owner runs the install script again", async ({ world }) => {
  await runInstall(world);
});

Then("the owner can open Offgrid in a browser", async ({ world, page, playwright }) => {
  const install = installOf(world);
  expect(install.lastRun?.exitCode, install.lastRun?.output).toBe(0);
  const api = await installedStackClient(playwright);
  try {
    await waitForInstalledStack(api);
  } finally {
    await api.dispose();
  }
  await page.goto(installedWebUrl());
  await expect(page).toHaveTitle("Offgrid");
});

Then("Docker is installed", async ({ world }) => {
  const log = await readHostFile(installOf(world).containerName, PACKAGE_MANAGER_LOG);
  expect(log).toContain("docker-ce");
});

Then("the install script stops", async ({ world }) => {
  expect(installOf(world).lastRun?.exitCode).not.toBe(0);
});

Then("the owner sees a message that this system is not supported", async ({ world }) => {
  expect(installOf(world).lastRun?.output).toContain("is not a supported system");
});

Then("the Kowalski family and its shopping list are still there", async ({ world, playwright }) => {
  const install = installOf(world);
  if (install.owner === undefined) {
    throw new Error("The owner account was not created.");
  }
  const api = await installedStackClient(playwright);
  try {
    expect(await readOwnerData(api, install.owner)).toEqual({
      familyDrives: 1,
      shoppingFolderFound: true,
    });
  } finally {
    await api.dispose();
  }
});

Then("the secrets are unchanged", async ({ world }) => {
  const install = installOf(world);
  expect(await secretsFingerprint(install.project)).toBe(install.secretsBefore);
});
