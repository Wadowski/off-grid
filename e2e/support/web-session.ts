// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "./factories/identity.js";
import { ensureRunAdmin, RUN_ADMIN_EMAIL, signInWith } from "./factories/instance-admin.js";
import type { APIRequestContext } from "@playwright/test";
import { scenarioClientAddress } from "./scenario-client-address.js";
import { webBaseUrl } from "./stack.js";

export type WebAccount = { email: string; password: string; displayName: string };

const FIRST_FAMILY_NAME = "Home";

const createFamilyFor = async (api: APIRequestContext, email: string): Promise<void> => {
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  expect(session, `${email} cannot sign in to create a family`).toBeDefined();
  const response = await api.post("/api/families", {
    headers: { authorization: `Bearer ${session?.accessToken ?? ""}` },
    data: { name: FIRST_FAMILY_NAME },
    failOnStatusCode: false,
  });
  expect(response.status(), "could not create the first family").toBe(201);
};

export const createWebAccount = async (
  api: APIRequestContext,
  displayName: string,
): Promise<WebAccount> => {
  const email = uniqueEmail(displayName.split(" ")[0]?.toLowerCase() ?? "person");
  const registration = await registerAccount(api, { email, displayName });
  expect(registration.status, `could not create ${displayName}`).toBe(201);
  await createFamilyFor(api, email);
  return { email, password: STRONG_PASSWORD, displayName };
};

export const runAdminAccount = async (api: APIRequestContext): Promise<WebAccount> => {
  const admin = await ensureRunAdmin(api);
  const response = await api.get("/api/families", {
    headers: { authorization: `Bearer ${admin.accessToken}` },
    failOnStatusCode: false,
  });
  const families = ((await response.json()) as { families: unknown[] }).families;
  if (families.length === 0) {
    await createFamilyFor(api, RUN_ADMIN_EMAIL);
  }
  return { email: RUN_ADMIN_EMAIL, password: STRONG_PASSWORD, displayName: "Run Admin" };
};

export const signInThroughUi = async (page: Page, account: WebAccount): Promise<void> => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": scenarioClientAddress() });
  await page.goto(`${webBaseUrl()}/sign-in`);
  await page.getByTestId("sign-in-email").fill(account.email);
  await page.getByTestId("sign-in-password").fill(account.password);
  await page.getByTestId("sign-in-submit").click();
  await expect(
    page
      .getByRole("button", { name: "Account menu" })
      .or(page.getByRole("heading", { name: "Create a Family Space" })),
  ).toBeVisible();
};

export const openUserMenu = async (page: Page): Promise<void> => {
  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("menu")).toBeVisible();
};
