// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { signInWith } from "../support/factories/instance-admin.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";

const { When, Then } = createBdd(test);

const FEATURE = "Create account screen";
const TOO_WEAK_MESSAGE = "Too weak. Use at least 12 characters.";

const notServed = (_world: ScenarioWorld, ...details: unknown[]): never => {
  throw new Error(
    `The e2e stack does not serve a fresh server to this scenario, so the create account step cannot run: ${details.join(", ")}.`,
  );
};

const newAccountEmail = (world: ScenarioWorld): string => {
  world.newAccountEmail ??= uniqueEmail("create");
  return world.newAccountEmail;
};

const fillAccountForm = async (
  page: Page,
  { email, confirmation = STRONG_PASSWORD }: { email: string; confirmation?: string },
): Promise<void> => {
  await page.getByTestId("create-account-name").fill("Anna Test");
  await page.getByTestId("create-account-email").fill(email);
  await page.getByTestId("create-account-password").fill(STRONG_PASSWORD);
  await page.getByTestId("create-account-confirmation").fill(confirmation);
};

const submitAccountForm = (page: Page) =>
  page.getByRole("button", { name: "Create account", exact: true }).click();

When("I open the create account page", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/create-account`);
  await expect(
    page
      .getByTestId("create-account-submit")
      .or(page.getByRole("heading", { name: "Registration is closed" })),
  ).toBeVisible();
});

When(
  "I fill in my name, email, password and confirmation and press {string}",
  async ({ page, world }, label: string) => {
    await fillAccountForm(page, { email: newAccountEmail(world) });
    await page.getByRole("button", { name: label, exact: true }).click();
  },
);

When("I type a short password", async ({ page }) => {
  await page.getByTestId("create-account-password").fill("short");
});

When("the confirmation does not match the password", async ({ page, world }) => {
  await fillAccountForm(page, {
    email: newAccountEmail(world),
    confirmation: "something else entirely",
  });
  await submitAccountForm(page);
});

When("I create an account with {string}", async ({ page }, email: string) => {
  await fillAccountForm(page, { email });
  await submitAccountForm(page);
});

When("I tick {string}", async ({ page }, label: string) => {
  await page.getByLabel(label).check();
});

When("I press {string}", async ({ page }, label: string) => {
  await page.getByRole("button", { name: label, exact: true }).click();
});

Then("after creating my account I am the admin", ({ world }) => notServed(world));

Then("the new account has the user role", async ({ world }) => {
  const response = await signInWith(world.api, newAccountEmail(world), STRONG_PASSWORD);
  expect(response.status).toBe(200);
  expect((response.body as { user?: { instanceRole?: string } }).user?.instanceRole).toBe("user");
});

Then("I see my recovery code", async ({ page }) => {
  await expect(page.getByTestId("recovery-code")).not.toBeEmpty();
  await captureScreen(page, "recovery code", FEATURE);
});

Then("the strength meter shows that it is too weak and says why", async ({ page }) => {
  await expect(page.getByText(TOO_WEAK_MESSAGE)).toBeVisible();
  await captureScreen(page, "password too weak", FEATURE);
});

Then("I see {string} and no account is created", async ({ page, world }, message: string) => {
  await expect(page.getByText(message)).toBeVisible();
  await expect(page.getByTestId("recovery-code")).toHaveCount(0);
  const response = await signInWith(world.api, newAccountEmail(world), STRONG_PASSWORD);
  expect(response.status).not.toBe(200);
  await captureScreen(page, "passwords do not match", FEATURE);
});

Then("I am told the email is already in use", async ({ page }) => {
  await expect(page.getByText("This email is already in use.")).toBeVisible();
  await captureScreen(page, "email already used", FEATURE);
});

Then(
  "{string} is disabled until I tick {string}",
  async ({ page }, button: string, box: string) => {
    await expect(page.getByRole("button", { name: button, exact: true })).toBeDisabled();
    await expect(page.getByLabel(box)).not.toBeChecked();
    await captureScreen(page, "recovery code step", FEATURE);
  },
);

Then("{string} is enabled", async ({ page }, button: string) => {
  await expect(page.getByRole("button", { name: button, exact: true })).toBeEnabled();
});

Then("I can copy the code", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: webBaseUrl(),
  });
  await page.getByRole("button", { name: "Copy", exact: true }).click();
  await expect(page.getByText("Copied")).toBeVisible();
});

Then("I can download the code as a text file", async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download as text file", exact: true }).click(),
  ]);
  expect(download.suggestedFilename()).toBe("offgrid-recovery-code.txt");
});

Then("I see that new accounts are not accepted and a link to sign in", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Registration is closed" })).toBeVisible();
  await expect(page.getByTestId("sign-in-link")).toHaveAttribute("href", "/sign-in");
  await captureScreen(page, "registration closed", FEATURE);
});
