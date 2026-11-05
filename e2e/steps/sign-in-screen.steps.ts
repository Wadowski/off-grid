// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { captureScreen } from "../support/screenshots.js";
import { webBaseUrl } from "../support/stack.js";

const { Given, When, Then } = createBdd(test);

const FEATURE = "Sign in screen";
const WRONG_PASSWORD = "not the right password";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const signInRequestCounts = new WeakMap<Page, number>();

const signInEmail = (world: ScenarioWorld): string => {
  world.signInEmail ??= uniqueEmail("sign-in");
  return world.signInEmail;
};

const countSignInRequests = (page: Page): number => signInRequestCounts.get(page) ?? 0;

const fillSignInForm = async (page: Page, email: string, password: string): Promise<void> => {
  await page.getByTestId("sign-in-email").fill(email);
  await page.getByTestId("sign-in-password").fill(password);
};

const pressButton = (page: Page, label: string) =>
  page.getByRole("button", { name: label, exact: true }).click();

Given("I have an account", async ({ world }) => {
  const registration = await registerAccount(world.api, {
    email: signInEmail(world),
    displayName: "Anna",
  });
  expect(registration.status).toBe(201);
});

Given("the server cannot be reached", async ({ page }) => {
  await page.route("**/api/**", (route) => route.abort());
});

When("I open the sign in page", async ({ page }) => {
  if (!signInRequestCounts.has(page)) {
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().endsWith("/auth/sign-in")) {
        signInRequestCounts.set(page, countSignInRequests(page) + 1);
      }
    });
  }
  await page.goto(`${webBaseUrl()}/sign-in`);
  await expect(page.getByTestId("sign-in-submit")).toBeVisible();
});

When("I enter my email and password and press {string}", async ({ page, world }, label: string) => {
  await fillSignInForm(page, signInEmail(world), STRONG_PASSWORD);
  await pressButton(page, label);
});

When(
  "I enter my email and a wrong password and press {string}",
  async ({ page, world }, label: string) => {
    await fillSignInForm(page, signInEmail(world), WRONG_PASSWORD);
    await pressButton(page, label);
  },
);

When("I enter my email and password and press Enter", async ({ page, world }) => {
  await fillSignInForm(page, signInEmail(world), STRONG_PASSWORD);
  await page.getByTestId("sign-in-password").press("Enter");
});

When(
  "I enter my email and password and press {string} twice quickly",
  async ({ page, world }, label: string) => {
    await fillSignInForm(page, signInEmail(world), STRONG_PASSWORD);
    const signInResponse = page.waitForResponse((response) =>
      response.url().endsWith("/auth/sign-in"),
    );
    await page.getByRole("button", { name: label, exact: true }).dblclick();
    await signInResponse;
  },
);

When("I type a password", async ({ page }) => {
  await page.getByTestId("sign-in-password").fill(STRONG_PASSWORD);
});

When("I press the show password button", async ({ page }) => {
  await page.getByTestId("sign-in-password-toggle").click();
});

When("Caps Lock is on while I type my password", async ({ page }) => {
  await page.evaluate(`(() => {
    const keyDown = new KeyboardEvent("keydown", { key: "A", bubbles: true });
    Object.defineProperty(keyDown, "getModifierState", { value: (key) => key === "CapsLock" });
    document.querySelector('[data-testid="sign-in-password"]').dispatchEvent(keyDown);
  })()`);
});

When(
  "I tick {string} and sign in with my email and password",
  async ({ page, world }, label: string) => {
    await page.getByLabel(label).check();
    await fillSignInForm(page, signInEmail(world), STRONG_PASSWORD);
    const signInResponse = page.waitForResponse((response) =>
      response.url().endsWith("/auth/sign-in"),
    );
    await pressButton(page, "Sign in");
    expect((await signInResponse).status()).toBe(200);
  },
);

Then("I see {string} and my email stays filled in", async ({ page, world }, message: string) => {
  await expect(page.getByRole("alert")).toContainText(message);
  await expect(page.getByTestId("sign-in-email")).toHaveValue(signInEmail(world));
  await captureScreen(page, "wrong password", FEATURE);
});

Then("my password is shown, and pressing the button again hides it", async ({ page }) => {
  const passwordInput = page.getByTestId("sign-in-password");
  await expect(passwordInput).toHaveAttribute("type", "text");
  await page.getByTestId("sign-in-password-toggle").click();
  await expect(passwordInput).toHaveAttribute("type", "password");
});

Then("I see a caps-lock warning", async ({ page }) => {
  await expect(page.getByRole("status")).toContainText("Caps Lock is on.");
  await captureScreen(page, "caps lock", FEATURE);
});

Then("I do not see the create account link", async ({ page }) => {
  await expect(page.getByTestId("sign-in-submit")).toBeVisible();
  await expect(page.getByTestId("create-account-link")).toHaveCount(0);
  await captureScreen(page, "registration closed", FEATURE);
});

Then("I stay signed in after closing the browser", async ({ page }) => {
  const cookies = await page.context().cookies();
  const persistsForThirtyDays = cookies.some(
    (cookie) => cookie.expires > 0 && cookie.expires * 1000 > Date.now() + THIRTY_DAYS_MS - 60_000,
  );
  expect(persistsForThirtyDays).toBe(true);
});

Then("the sign in request is sent once", async ({ page }) => {
  await expect.poll(() => countSignInRequests(page)).toBe(1);
});

Then("I see that the server cannot be reached and can try again", async ({ page }) => {
  await expect(page.getByRole("alert")).toContainText("cannot be reached");
  await expect(page.getByTestId("sign-in-submit")).toBeEnabled();
  await captureScreen(page, "server not reachable", FEATURE);
});
