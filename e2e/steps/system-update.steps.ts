// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { ensureRunAdmin, signInWith } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { FAILING_RELEASE_VERSION } from "../support/release-source/constants.js";
import { ensureReleaseSource } from "../support/release-source/ensure-release-source.js";
import { readLatestVersion } from "../support/release-source/read-latest-version.js";
import { releaseSourceDirectory } from "../support/release-source/release-source-directory.js";
import { breakBackups } from "../support/system-update/break-backups.js";
import { checkForUpdatesOnScreen } from "../support/system-update/check-for-updates-on-screen.js";
import {
  CHECK_BUTTON_ID,
  NIGHTLY_TOGGLE_ID,
  NO_ACCESS_TEXT,
  PROGRESS_ID,
  RESULT_ID,
  UPDATE_FINISH_TIMEOUT_MS,
} from "../support/system-update/constants.js";
import { expectedReleaseHost } from "../support/system-update/expected-release-host.js";
import { newerGoodVersion } from "../support/system-update/newer-good-version.js";
import { giveMemberAFamily } from "../support/system-update/give-member-a-family.js";
import { isRegularUserScenario } from "../support/system-update/is-regular-user-scenario.js";
import { memberWebAccount } from "../support/system-update/member-web-account.js";
import { openAdminPage } from "../support/system-update/open-admin-page.js";
import { openSystemUpdateScreen } from "../support/system-update/open-system-update-screen.js";
import { readRunningVersion } from "../support/system-update/read-running-version.js";
import { requestedReleaseHosts } from "../support/system-update/requested-release-hosts.js";
import { requestNightlyUpdate } from "../support/system-update/request-nightly-update.js";
import { requestUpdateApply } from "../support/system-update/request-update-apply.js";
import { requestUpdateCheck } from "../support/system-update/request-update-check.js";
import { requestUpdateOverview } from "../support/system-update/request-update-overview.js";
import { restoreBackups } from "../support/system-update/restore-backups.js";
import { setLatestVersion } from "../support/system-update/set-latest-version.js";
import { startUpdateOnScreen } from "../support/system-update/start-update-on-screen.js";
import { updateSection } from "../support/system-update/update-section.js";
import { updateWorldOf } from "../support/system-update/update-world-of.js";
import { waitForRunningVersion } from "../support/system-update/wait-for-running-version.js";
import { runAdminAccount } from "../support/web-session.js";

const { Given, When, Then, After } = createBdd(test);

const memberSession = async (world: ScenarioWorld) => {
  const member = world.member;
  if (member === undefined) {
    throw new Error("No regular user has been created in this scenario.");
  }
  const result = await signInWith(world.api, member.email, member.password);
  if (result.session === undefined) {
    throw new Error("The regular user cannot sign in.");
  }
  return { member, session: result.session };
};

After(async ({ world }) => {
  const update = world.systemUpdate;
  if (update?.backupsBroken === true) {
    await restoreBackups();
  }
  if (update?.nightlyTouched === true) {
    await requestNightlyUpdate(world.api, await ensureRunAdmin(world.api), false);
  }
  const hosts = await requestedReleaseHosts();
  expect(hosts.filter((host) => host !== expectedReleaseHost())).toEqual([]);
});

Given("a newer release has been published", async ({ world }) => {
  await ensureReleaseSource();
  const previousVersion = await readRunningVersion(world.api);
  const targetVersion = newerGoodVersion(previousVersion);
  await setLatestVersion(targetVersion);
  Object.assign(updateWorldOf(world), { previousVersion, targetVersion });
});

Given("the database backup fails", async ({ world }) => {
  await breakBackups();
  updateWorldOf(world).backupsBroken = true;
});

Given("the new version fails its health check", async ({ world }) => {
  await setLatestVersion(FAILING_RELEASE_VERSION);
  updateWorldOf(world).targetVersion = FAILING_RELEASE_VERSION;
});

When("I open the system update screen", async ({ page, world }) => {
  if (isRegularUserScenario(world)) {
    await giveMemberAFamily(world.api, (await memberSession(world)).session);
    await openAdminPage(page, memberWebAccount(world));
    return;
  }
  await ensureReleaseSource();
  await openSystemUpdateScreen(page, await runAdminAccount(world.api));
  await checkForUpdatesOnScreen(page, await readLatestVersion(releaseSourceDirectory()));
});

When("I start the update", async ({ page, world }) => {
  await openSystemUpdateScreen(page, await runAdminAccount(world.api));
  await checkForUpdatesOnScreen(page, updateWorldOf(world).targetVersion);
  await startUpdateOnScreen(page);
});

When("I try to start the update", async ({ world }) => {
  const { session } = await memberSession(world);
  const response = await requestUpdateApply(world.api, session);
  world.response = { status: response.status(), body: await response.json() };
});

When("I turn on the nightly automatic update", async ({ page, world }) => {
  await openSystemUpdateScreen(page, await runAdminAccount(world.api));
  updateWorldOf(world).nightlyTouched = true;
  await page.getByTestId(NIGHTLY_TOGGLE_ID).check();
  await expect(page.getByTestId(NIGHTLY_TOGGLE_ID)).toBeEnabled();
});

Then("I can see the version that is running", async ({ page, world }) => {
  const version = await readRunningVersion(world.api);
  await expect(updateSection(page)).toContainText(`Running version${version}`);
});

Then("I can see the latest version available", async ({ page }) => {
  const latest = await readLatestVersion(releaseSourceDirectory());
  await expect(updateSection(page)).toContainText(`Latest version${latest}`);
});

Then("I can see the update in progress", async ({ page, world }) => {
  await expect(page.getByTestId(PROGRESS_ID)).toContainText(
    `Updating to ${updateWorldOf(world).targetVersion}`,
  );
});

Then("I can see the new version running", async ({ page, world }) => {
  const { targetVersion } = updateWorldOf(world);
  await expect(page.getByTestId(RESULT_ID)).toContainText(`Updated to version ${targetVersion}`, {
    timeout: UPDATE_FINISH_TIMEOUT_MS,
  });
  await waitForRunningVersion(world.api, targetVersion);
});

Then("the update does not start", async ({ page, world }) => {
  const { previousVersion } = updateWorldOf(world);
  if (isRegularUserScenario(world)) {
    const admin = await ensureRunAdmin(world.api);
    const overview = (await (await requestUpdateOverview(world.api, admin)).json()) as {
      running: boolean;
    };
    expect(overview.running).toBe(false);
  } else {
    await expect(page.getByTestId(RESULT_ID)).toContainText("The update did not finish.", {
      timeout: UPDATE_FINISH_TIMEOUT_MS,
    });
  }
  expect(await readRunningVersion(world.api)).toBe(previousVersion);
});

Then("I can see that the backup failed", async ({ page }) => {
  await expect(page.getByTestId(RESULT_ID)).toContainText("Backing up the database");
});

Then("the previous version is running again", async ({ page, world }) => {
  const { previousVersion } = updateWorldOf(world);
  await expect(page.getByTestId(RESULT_ID)).toContainText(
    "The update failed and the system went back to the previous version.",
    { timeout: UPDATE_FINISH_TIMEOUT_MS },
  );
  await waitForRunningVersion(world.api, previousVersion);
});

Then("I can see that the update was rolled back", async ({ page }) => {
  await expect(page.getByTestId(RESULT_ID)).toContainText("went back to the previous version");
});

Then("I see that only an admin can check for updates", async ({ page, world }) => {
  await expect(page.getByText(NO_ACCESS_TEXT)).toBeVisible();
  await expect(page.getByTestId(CHECK_BUTTON_ID)).toHaveCount(0);
  const { session } = await memberSession(world);
  expect((await requestUpdateCheck(world.api, session)).status()).toBe(403);
});

Then("I see that only an admin can start an update", async ({ world }) => {
  expect(world.response?.status).toBe(403);
});

Then("the nightly automatic update is turned off", async ({ page }) => {
  await expect(page.getByTestId(NIGHTLY_TOGGLE_ID)).not.toBeChecked();
});

Then("the nightly automatic update is turned on", async ({ page }) => {
  await page.reload();
  await expect(page.getByTestId(NIGHTLY_TOGGLE_ID)).toBeChecked();
});
