// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";
import { bearer, memberSessionOf, sessionOf } from "../support/family-sessions.js";

const { When, Then } = createBdd(test);

const FEATURE = "Family manager screen";
const MANAGER_HEADING = "Family members";
const MEMBER_ROW = "family-member-row";
const MEMBER_LIST = "family-member-list";
const ROLE_SELECT = "family-member-role";
const REMOVE_BUTTON = "family-member-remove";
const INVITE_BUTTON = "Invite someone";
const CREATE_CODE_BUTTON = "Create invitation code";
const REVOKE_BUTTON = "Revoke invitation";
const INVITE_DIALOG = "family-invite-dialog";
const INVITE_CODE = "family-invite-code";
const REVOKED_TEXT = "Invitation revoked. The code no longer works.";

const familyIdNamed = (world: ScenarioWorld, name: string): string => {
  const family = world.families.find((created) => created.name === name);
  expect(family, `family "${name}" was not created`).toBeDefined();
  return family?.id ?? "";
};

const memberRow = (page: Page, name: string) =>
  page.getByTestId(MEMBER_ROW).filter({ hasText: name });

// Names reach the family module through events, so a member can show as unnamed
// for a moment after they join or sign up. Wait for the copies before the page loads.
const waitForNames = async (world: ScenarioWorld, familyId: string): Promise<void> => {
  await eventually(async () => {
    const response = await world.api.get(`/api/families/${familyId}/members`, {
      headers: bearer(memberSessionOf(world)),
      failOnStatusCode: false,
    });
    const { members } = (await response.json()) as { members: { displayName: string | null }[] };
    expect(members.every((member) => member.displayName !== null)).toBe(true);
  });
};

const openManager = async (page: Page, world: ScenarioWorld, familyId: string): Promise<void> => {
  await waitForNames(world, familyId);
  await page.goto(`${webBaseUrl()}/settings/families/${familyId}`);
  await expect(page.getByRole("heading", { name: MANAGER_HEADING })).toBeVisible();
  await expect(page.getByTestId(MEMBER_LIST)).toBeVisible();
};

const roleValue = (role: string): string => role.toLowerCase();

When("I open the family manager for {string}", async ({ page, world }, familyName: string) => {
  await openManager(page, world, familyIdNamed(world, familyName));
  await captureScreen(page, "family manager", FEATURE);
});

When(
  "I open the family manager for {string} on a phone-sized screen",
  async ({ page, world }, familyName: string) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await openManager(page, world, familyIdNamed(world, familyName));
    await captureScreen(page, "family manager phone", FEATURE);
  },
);

// Outside manage mode a row shows its role as a tag; in manage mode it shows the role select.
const expectRole = async (page: Page, name: string, role: string): Promise<void> => {
  const row = memberRow(page, name);
  const select = row.getByTestId(ROLE_SELECT);
  if ((await select.count()) > 0) {
    await expect(select).toHaveValue(roleValue(role));
    return;
  }
  await expect(row).toContainText(role);
};

When("I start managing the members", async ({ page }) => {
  await page.getByRole("button", { name: "Manage", exact: true }).click();
  await expect(page.getByTestId(ROLE_SELECT).first()).toBeVisible();
});

Then("I see the members with their admin controls", async ({ page }) => {
  await expect(page.getByTestId(ROLE_SELECT).first()).toBeVisible();
  await captureScreen(page, "family manager managing", FEATURE);
});

Then("the member {string} has the role {string}", async ({ page }, name: string, role: string) => {
  await expectRole(page, name, role);
});

Then("I see my own display name with the role {string}", async ({ page, world }, role: string) => {
  await expectRole(page, world.ownAccount?.displayName ?? "", role);
});

When("I change the role of {string} to {string}", async ({ page }, name: string, role: string) => {
  await memberRow(page, name).getByTestId(ROLE_SELECT).selectOption(roleValue(role));
});

When("I change my own role to {string}", async ({ page, world }, role: string) => {
  const name = world.ownAccount?.displayName ?? "";
  await memberRow(page, name).getByTestId(ROLE_SELECT).selectOption(roleValue(role));
});

When("I remove {string} from the family", async ({ page }, name: string) => {
  await memberRow(page, name).getByTestId(REMOVE_BUTTON).click();
  await expect(memberRow(page, name)).toHaveCount(0);
});

Then("I do not see {string} in the members", async ({ page }, name: string) => {
  await expect(page.getByTestId(MEMBER_LIST)).not.toContainText(name);
});

Then("I see the members of the family", async ({ page }) => {
  await expect(page.getByTestId(MEMBER_ROW).first()).toBeVisible();
});

Then("I do not see any admin actions", async ({ page }) => {
  await expect(page.getByTestId(ROLE_SELECT)).toHaveCount(0);
  await expect(page.getByTestId(REMOVE_BUTTON)).toHaveCount(0);
  await expect(page.getByRole("button", { name: INVITE_BUTTON })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Manage", exact: true })).toHaveCount(0);
});

Then("I can change a role, remove a member and create an invitation", async ({ page }) => {
  await expect(page.getByTestId(ROLE_SELECT).first()).toBeVisible();
  await expect(page.getByTestId(REMOVE_BUTTON).first()).toBeVisible();
  await expect(page.getByRole("button", { name: INVITE_BUTTON })).toBeVisible();
  const overflows = await page.evaluate("document.documentElement.scrollWidth > window.innerWidth");
  expect(overflows, "the family manager scrolls sideways at phone width").toBe(false);
  await captureScreen(page, "family manager phone check", FEATURE);
});

When("I create an invitation", async ({ page, world }) => {
  await page.getByRole("button", { name: INVITE_BUTTON }).click();
  const dialog = page.getByTestId(INVITE_DIALOG);
  await dialog.getByRole("button", { name: CREATE_CODE_BUTTON }).click();
  await expect(dialog.getByTestId(INVITE_CODE)).toBeVisible();
  world.invitationCode = (await dialog.getByTestId(INVITE_CODE).textContent())?.trim();
  await captureScreen(page, "invite dialog", FEATURE);
});

Then("I see an invitation code", async ({ page }) => {
  await expect(page.getByTestId(INVITE_DIALOG).getByTestId(INVITE_CODE)).toBeVisible();
});

Then("the invitation code is shown only in the invite dialog", async ({ page, world }) => {
  const code = world.invitationCode ?? "";
  expect(code, "no invitation code was shown").not.toBe("");
  await expect(page.getByTestId(INVITE_DIALOG)).toContainText(code);
  await expect(page.getByTestId(MEMBER_LIST)).not.toContainText(code);
});

When("I revoke the invitation from the invite dialog", async ({ page }) => {
  const dialog = page.getByTestId(INVITE_DIALOG);
  await dialog.getByRole("button", { name: REVOKE_BUTTON }).click();
  await expect(dialog.getByText(REVOKED_TEXT)).toBeVisible();
});

Then("the invitation code no longer works", async ({ world }) => {
  const joiner = await sessionOf(world.api, "Late Joiner");
  const response = await world.api.post("/api/families/join", {
    headers: bearer(joiner),
    data: { code: world.invitationCode },
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(404);
});
