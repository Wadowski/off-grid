// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { recoveryCodeMailedTo } from "../support/mail-catcher.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { ensureRunAdmin } from "../support/factories/instance-admin.js";
import { saveMailSettings } from "../support/factories/mail-setup.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const NEW_PASSWORD = "amber lantern meadow river 2026";
const WRONG_CODE = "00000000";
const WEAK_PASSWORD = "too short";
const DIFFERENT_CONFIRMATION = "something else entirely";
const RECOVERY_METHOD_LABEL = "Use my recovery code";
const EMAIL_METHOD_LABEL = "Email me a code";
const RECOVERY_REQUEST_PATTERN = /\/auth\/password-(recovery|reset)/;

const MAIL_CATCHER_SETTINGS = {
  provider: "other",
  email: "offgrid@example.com",
  password: "not-checked-by-the-catcher",
  smtpHost: "mail",
  smtpPort: 1025,
  smtpSecurity: "none",
};

const recoveryRequestCounts = new WeakMap<Page, number>();

const countRecoveryRequests = (page: Page): void => {
  page.on("request", (request) => {
    if (request.method() === "POST" && RECOVERY_REQUEST_PATTERN.test(request.url())) {
      recoveryRequestCounts.set(page, (recoveryRequestCounts.get(page) ?? 0) + 1);
    }
  });
};

const recoveryAccountOf = (world: ScenarioWorld) => {
  if (world.recoveryAccount === undefined) {
    throw new Error("No account has been created for this scenario.");
  }
  return world.recoveryAccount;
};

const ensureRecoveryAccount = async (world: ScenarioWorld) => {
  if (world.recoveryAccount === undefined) {
    const email = uniqueEmail("forgot");
    const registration = await registerAccount(world.api, {
      email,
      displayName: "Anna",
      password: STRONG_PASSWORD,
    });
    expect(registration.status, "could not create the account").toBe(201);
    world.recoveryAccount = {
      email,
      password: STRONG_PASSWORD,
      recoveryCode: (registration.body as { recoveryCode: string }).recoveryCode,
    };
  }
  return recoveryAccountOf(world);
};

const configureMailCatcher = async (world: ScenarioWorld): Promise<void> => {
  const admin = await ensureRunAdmin(world.api);
  const response = await saveMailSettings(world.api, admin, MAIL_CATCHER_SETTINGS);
  expect(response.status(), "could not save mail settings").toBe(200);
};

const openForgotPasswordFromSignIn = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}/sign-in`);
  await page.getByTestId("forgot-password-link").click();
  await expect(page.getByTestId("forgot-password-form")).toBeVisible();
};

const chooseMethodAndContinue = async (
  page: Page,
  email: string,
  methodLabel: string,
): Promise<void> => {
  await page.getByTestId("forgot-password-email").fill(email);
  await page.getByLabel(methodLabel).check();
  await page.getByTestId("forgot-password-submit").click();
  await expect(page.getByTestId("reset-password-form")).toBeVisible();
};

const fillResetForm = async (
  page: Page,
  values: { readonly code: string; readonly password: string; readonly confirmation: string },
): Promise<void> => {
  await page.getByTestId("reset-password-code").fill(values.code);
  await page.getByTestId("reset-password-password").fill(values.password);
  await page.getByTestId("reset-password-confirmation").fill(values.confirmation);
};

const submitReset = (page: Page) => page.getByTestId("reset-password-submit").click();

const expectNewRecoveryCodeShown = async (page: Page): Promise<string> => {
  await expect(page.getByTestId("recovery-code")).toBeVisible();
  const code = (await page.getByTestId("recovery-code").textContent())?.trim();
  expect(code, "the success screen shows no recovery code").toBeTruthy();
  return code ?? "";
};

Given("I have my recovery code", async ({ world }) => {
  await ensureRecoveryAccount(world);
});

Given("email is configured on the server", async ({ world }) => {
  await configureMailCatcher(world);
});

Given("email is not configured", async ({ page }) => {
  await page.route("**/api/auth/password-recovery/options", (route) =>
    route.fulfill({ json: { emailCodeAvailable: false } }),
  );
  const optionsLoaded = page.waitForResponse((response) =>
    response.url().endsWith("/auth/password-recovery/options"),
  );
  await page.goto(`${webBaseUrl()}/forgot-password`);
  await optionsLoaded;
});

Given("I am on the forgot password page", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/forgot-password`);
  await expect(page.getByTestId("forgot-password-form")).toBeVisible();
});

When(
  "I open {string}, choose {string} and set a new password",
  async ({ page, world }, _link: string, methodLabel: string) => {
    const account = await ensureRecoveryAccount(world);
    await openForgotPasswordFromSignIn(page);
    await chooseMethodAndContinue(page, account.email, methodLabel);
    await fillResetForm(page, {
      code: account.recoveryCode ?? "",
      password: NEW_PASSWORD,
      confirmation: NEW_PASSWORD,
    });
    await submitReset(page);
    account.newRecoveryCode = await expectNewRecoveryCodeShown(page);
  },
);

When(
  "I choose {string} and enter the code I received",
  async ({ page, world }, methodLabel: string) => {
    const account = await ensureRecoveryAccount(world);
    await openForgotPasswordFromSignIn(page);
    await expect(page.getByLabel(EMAIL_METHOD_LABEL)).toBeVisible();
    await chooseMethodAndContinue(page, account.email, methodLabel);
    const code = await recoveryCodeMailedTo(account.email);
    await page.getByTestId("reset-password-code").fill(code);
  },
);

When("I ask for an emailed code for any email address", async ({ page }) => {
  await openForgotPasswordFromSignIn(page);
  await expect(page.getByLabel(EMAIL_METHOD_LABEL)).toBeVisible();
  await chooseMethodAndContinue(page, uniqueEmail("nobody"), EMAIL_METHOD_LABEL);
});

When("I enter a wrong or expired code", async ({ page, world }) => {
  const account = await ensureRecoveryAccount(world);
  await openForgotPasswordFromSignIn(page);
  await chooseMethodAndContinue(page, account.email, RECOVERY_METHOD_LABEL);
  await fillResetForm(page, {
    code: WRONG_CODE,
    password: NEW_PASSWORD,
    confirmation: NEW_PASSWORD,
  });
  await submitReset(page);
});

When("my new password is too weak or the confirmation differs", async ({ page, world }) => {
  const account = await ensureRecoveryAccount(world);
  await openForgotPasswordFromSignIn(page);
  await chooseMethodAndContinue(page, account.email, RECOVERY_METHOD_LABEL);
  await fillResetForm(page, {
    code: account.recoveryCode ?? "",
    password: WEAK_PASSWORD,
    confirmation: DIFFERENT_CONFIRMATION,
  });
  countRecoveryRequests(page);
  await submitReset(page);
  await expect(page.getByText("Use at least 12 characters.", { exact: true })).toBeVisible();
});

const signInWithNewPassword = async (page: Page, email: string): Promise<void> => {
  await page.getByLabel("I saved my recovery code").check();
  await page.getByTestId("recovery-continue").click();
  await expect(page).toHaveURL(`${webBaseUrl()}/sign-in`);
  await page.getByTestId("sign-in-email").fill(email);
  await page.getByTestId("sign-in-password").fill(NEW_PASSWORD);
  await page.getByTestId("sign-in-submit").click();
  await page.waitForURL((url) => !url.pathname.endsWith("/sign-in"));
};

Then("I can sign in with the new password", async ({ page, world }) => {
  await signInWithNewPassword(page, recoveryAccountOf(world).email);
});

Then("I see a new recovery code", async ({ page, world }) => {
  const account = recoveryAccountOf(world);
  const code = await expectNewRecoveryCodeShown(page);
  expect(code).not.toBe(account.recoveryCode);
  account.newRecoveryCode = code;
});

Then("I can set a new password", async ({ page, world }) => {
  await page.getByTestId("reset-password-password").fill(NEW_PASSWORD);
  await page.getByTestId("reset-password-confirmation").fill(NEW_PASSWORD);
  await submitReset(page);
  await expectNewRecoveryCodeShown(page);
  await signInWithNewPassword(page, recoveryAccountOf(world).email);
});

Then('the "Email me a code" option is not offered', async ({ page }) => {
  await expect(page.getByLabel(RECOVERY_METHOD_LABEL)).toBeVisible();
  await expect(page.getByLabel(EMAIL_METHOD_LABEL)).toHaveCount(0);
});

Then("I see a clear message and can try again or go back", async ({ page }) => {
  await expect(page.getByText(/wrong or has expired/)).toBeVisible();
  await expect(page.getByTestId("reset-password-form")).toBeVisible();
  await expect(page.getByTestId("reset-password-back")).toBeVisible();
});

Then("I see what to fix and nothing is sent", async ({ page }) => {
  await expect(page.getByText("Use at least 12 characters.", { exact: true })).toBeVisible();
  await expect(page.getByText("Passwords do not match")).toBeVisible();
  expect(recoveryRequestCounts.get(page) ?? 0).toBe(0);
});

Then("I am on the sign-in page", async ({ page }) => {
  await expect(page).toHaveURL(`${webBaseUrl()}/sign-in`);
});
