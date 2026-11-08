// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import {
  createMember,
  ensureRunAdmin,
  listUsers,
  RUN_ADMIN_EMAIL,
  type Member,
} from "../support/factories/instance-admin.js";
import { APP_PASSWORD, saveMailSettings } from "../support/factories/mail-setup.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { scenarioClientAddress } from "../support/scenario-client-address.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const ADMIN_PATH = "/admin";
const EMAIL_PATH = "/admin/email";
const FAMILY_NAME = "Rostova Family";
const CATCHER_HOST = "mail";
const CATCHER_PORT = 1025;

const memberOf = (world: ScenarioWorld): Member => {
  if (world.member === undefined) {
    throw new Error("No member has been created in this scenario.");
  }
  return world.member;
};

const signInThroughUi = async (page: Page, email: string, password: string): Promise<void> => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": scenarioClientAddress() });
  await page.goto(`${webBaseUrl()}/sign-in`);
  await page.getByTestId("sign-in-email").fill(email);
  await page.getByTestId("sign-in-password").fill(password);
  await page.getByTestId("sign-in-submit").click();
  const accountMenu = page.getByRole("button", { name: "Account menu", exact: true });
  const firstFamilyHeading = page.getByRole("heading", { name: "Create a Family Space" });
  await expect(accountMenu.or(firstFamilyHeading)).toBeVisible();
  if (await firstFamilyHeading.isVisible()) {
    await page.getByTestId("create-family-name").fill(FAMILY_NAME);
    await page.getByTestId("create-family-submit").click();
    await expect(accountMenu).toBeVisible();
  }
};

const openAdminPage = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}${ADMIN_PATH}`);
};

const openEmailPage = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}${EMAIL_PATH}`);
};

const personRow = (page: Page, member: Member) => page.getByTestId(`admin-person-${member.userId}`);

Given("I am a regular member signed in to the web app", async ({ page, world }) => {
  const member = await createMember(world.api, "member");
  world.member = member;
  await signInThroughUi(page, member.email, member.password);
});

Then("the user menu has no {string}", async ({ page }, label: string) => {
  await page.getByRole("button", { name: "Account menu", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: label, exact: true })).toHaveCount(0);
});

When("I open the admin settings page", async ({ page }) => {
  await openAdminPage(page);
});

Given("I am the admin signed in to the web app", async ({ page, world }) => {
  world.admin = await ensureRunAdmin(world.api);
  await signInThroughUi(page, RUN_ADMIN_EMAIL, STRONG_PASSWORD);
});

Given("Tom has an active account", async ({ world }) => {
  const email = uniqueEmail("tom");
  const registration = await registerAccount(world.api, {
    email,
    displayName: "Tom",
    password: STRONG_PASSWORD,
  });
  expect(registration.status, "could not create Tom's account").toBe(201);
  const body = registration.body as { user: { id: string } };
  world.member = { userId: body.user.id, email, password: STRONG_PASSWORD };
});

Given("I am the only active admin", async ({ world }) => {
  const admin = await ensureRunAdmin(world.api);
  world.admin = admin;
  const response = await listUsers(world.api, admin);
  const body = (await response.json()) as {
    users: { instanceRole: string; status: string }[];
  };
  const activeAdmins = body.users.filter(
    (user) => user.instanceRole === "admin" && user.status === "active",
  );
  expect(activeAdmins, "more than one active admin exists").toHaveLength(1);
});

When("I disable Tom's account and confirm", async ({ page, world }) => {
  await openAdminPage(page);
  const row = personRow(page, memberOf(world));
  await row.getByRole("button", { name: "Disable", exact: true }).click();
  await row.getByRole("button", { name: "Confirm disable", exact: true }).click();
});

Then("Tom is shown as disabled", async ({ page, world }) => {
  await expect(
    personRow(page, memberOf(world)).getByText("Disabled", { exact: true }),
  ).toBeVisible();
});

Then("my own account cannot be disabled and the screen explains why", async ({ page, world }) => {
  await openAdminPage(page);
  const ownRow = page.getByTestId(`admin-person-${world.admin?.userId ?? ""}`);
  await expect(ownRow.getByRole("button", { name: "Disable", exact: true })).toBeDisabled();
  await expect(ownRow.getByText("This is the last active admin", { exact: false })).toBeVisible();
});

When("I choose {string} for Tom", async ({ page, world }, action: string) => {
  await openAdminPage(page);
  await personRow(page, memberOf(world)).getByRole("button", { name: action, exact: true }).click();
});

Then("I see a one-time code and what to tell Tom", async ({ page }) => {
  const issued = page.getByTestId("admin-reset-code");
  await expect(issued).toBeVisible();
  await expect(issued.getByText("Tell them", { exact: false })).toBeVisible();
});

When("I turn off {string}", async ({ page, world }, label: string) => {
  await openAdminPage(page);
  const saved = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/admin/instance-settings") &&
      response.request().method() === "PATCH",
  );
  await page.getByLabel(label, { exact: true }).uncheck();
  await saved;
  world.registrationTouched = true;
});

Then("the sign-in page no longer offers {string}", async ({ browser, world }, label: string) => {
  const status = await world.api.get("/api/auth/registration-status");
  expect((await status.json()) as { registrationOpen: boolean }).toMatchObject({
    registrationOpen: false,
  });
  const context = await browser.newContext({
    extraHTTPHeaders: { "x-forwarded-for": scenarioClientAddress() },
  });
  const page = await context.newPage();
  await page.goto(`${webBaseUrl()}/sign-in`);
  await expect(page.getByTestId("sign-in-email")).toBeVisible();
  await expect(page.getByText(label, { exact: true })).toHaveCount(0);
  await context.close();
});

When("I open the email setup page", async ({ page }) => {
  await openEmailPage(page);
});

When("I choose Gmail", async ({ page }) => {
  await page.getByRole("radio", { name: "Gmail", exact: true }).check();
});

Then("only the email address and app password are asked", async ({ page }) => {
  await expect(page.getByTestId("admin-email-address")).toBeVisible();
  await expect(page.getByTestId("admin-email-app-password")).toBeVisible();
  await expect(page.getByTestId("admin-email-host")).toHaveCount(0);
  await expect(page.getByTestId("admin-email-port")).toHaveCount(0);
});

When("I choose Other and fill in the mail catcher server", async ({ page }) => {
  await page.getByRole("radio", { name: "Other", exact: true }).check();
  await page.getByTestId("admin-email-address").fill(RUN_ADMIN_EMAIL);
  await page.getByTestId("admin-email-app-password").fill(APP_PASSWORD);
  await page.getByTestId("admin-email-host").fill(CATCHER_HOST);
  await page.getByTestId("admin-email-port").fill(String(CATCHER_PORT));
  await page.getByRole("radio", { name: "None", exact: true }).check();
});

Given("email is connected", async ({ world }) => {
  const admin = await ensureRunAdmin(world.api);
  world.admin = admin;
  const response = await saveMailSettings(world.api, admin, {
    provider: "other",
    email: RUN_ADMIN_EMAIL,
    password: APP_PASSWORD,
    smtpHost: CATCHER_HOST,
    smtpPort: CATCHER_PORT,
    smtpSecurity: "none",
  });
  expect(response.status(), "could not save mail settings").toBe(200);
});

Then("the saved password is not visible anywhere on the page", async ({ page }) => {
  await openEmailPage(page);
  await expect(page.getByTestId("admin-email-form")).toBeVisible();
  await expect(page.getByTestId("admin-email-app-password")).toHaveValue("");
  expect(await page.content()).not.toContain(APP_PASSWORD);
});
