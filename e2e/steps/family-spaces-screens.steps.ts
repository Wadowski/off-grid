// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { registerAccount, STRONG_PASSWORD, uniqueEmail } from "../support/factories/identity.js";
import { signInWith, type Session } from "../support/factories/instance-admin.js";
import { webBaseUrl } from "../support/stack.js";
import { signInThroughUi, type WebAccount } from "../support/web-session.js";
import { bearer, memberSessionOf } from "../support/family-sessions.js";

const { Given, When, Then } = createBdd(test);

const CREATE_SPACE_PATH = "/families/new";
const SETTINGS_PATH = "/settings/families";
const CREATE_HEADING = "Create a Family Space";
const SPACES_HEADING = "Family Spaces & Members";
const SPACE_ROW = "family-space-row";
const SPACE_LIST = "family-space-list";

const accountWithSession = async (
  api: ScenarioWorld["api"],
  displayName: string,
): Promise<{ account: WebAccount; session: Session }> => {
  const email = uniqueEmail(displayName.split(" ")[0]?.toLowerCase() ?? "person");
  const registration = await registerAccount(api, { email, displayName });
  expect(registration.status, `could not create ${displayName}`).toBe(201);
  const { session } = await signInWith(api, email, STRONG_PASSWORD);
  expect(session, `${displayName} cannot sign in`).toBeDefined();
  return {
    account: { email, password: STRONG_PASSWORD, displayName },
    session: session as Session,
  };
};

type SavedSpace = { name: string; accent: string; purpose: string };

const spaceRow = (page: Page, name: string) =>
  page.getByTestId(SPACE_ROW).filter({ hasText: name });

const roleText = (role: string): RegExp => new RegExp(role.charAt(0).toUpperCase() + role.slice(1));

const accentLabel = (accent: string): string => accent.charAt(0).toUpperCase() + accent.slice(1);

const openCreateSpace = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}${CREATE_SPACE_PATH}`);
  await expect(page.getByRole("heading", { name: CREATE_HEADING })).toBeVisible();
};

const openSettings = async (page: Page): Promise<void> => {
  await page.goto(`${webBaseUrl()}${SETTINGS_PATH}`);
  await expect(page.getByRole("heading", { name: SPACES_HEADING })).toBeVisible();
  await expect(page.getByTestId(SPACE_LIST)).toBeVisible();
};

const expectRoleIn = async (page: Page, name: string, role: string): Promise<void> => {
  await expect(spaceRow(page, name)).toContainText(roleText(role));
};

Given("I am a user with a family named {string}", async ({ page, world }, name: string) => {
  const { account, session } = await accountWithSession(world.api, "Ana Spaces");
  const response = await world.api.post("/api/families", {
    headers: bearer(session),
    data: { name },
    failOnStatusCode: false,
  });
  expect(response.status(), `could not create "${name}"`).toBe(201);
  world.families.push((await response.json()) as { id: string; name: string });
  world.userId = session.userId;
  world.memberAccessToken = session.accessToken;
  world.ownAccount = { ...account };
  await signInThroughUi(page, account);
});

Given(
  "another user adds me to a family named {string} as a member",
  async ({ world }, name: string) => {
    const { session: owner } = await accountWithSession(world.api, "Cabin Owner");
    const created = await world.api.post("/api/families", {
      headers: bearer(owner),
      data: { name },
      failOnStatusCode: false,
    });
    expect(created.status(), `could not create "${name}"`).toBe(201);
    const family = (await created.json()) as { id: string; name: string };
    world.families.push(family);

    const invitation = await world.api.post(`/api/families/${family.id}/invitations`, {
      headers: bearer(owner),
      failOnStatusCode: false,
    });
    expect(invitation.status(), "the invitation was not created").toBe(201);
    const { code } = (await invitation.json()) as { code: string };

    const joined = await world.api.post("/api/families/join", {
      headers: bearer(memberSessionOf(world)),
      data: { code },
      failOnStatusCode: false,
    });
    expect(joined.ok(), `could not join "${name}"`).toBe(true);
  },
);

When(
  "I create a family space named {string} from the create family space screen",
  async ({ page }, name: string) => {
    await openCreateSpace(page);
    await page.getByLabel("Family or Household Name").fill(name);
    await page.getByTestId("create-family-submit").click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(SETTINGS_PATH);
  },
);

When(
  "I create a family space named {string} choosing the {string} accent colour and the {string} space purpose",
  async ({ page }, name: string, accent: string, purpose: string) => {
    await openCreateSpace(page);
    await page.getByRole("button", { name: new RegExp(`^${accentLabel(accent)}$`) }).click();
    await page.getByRole("radio", { name: new RegExp(`^${purpose}`) }).click();
    await page.getByLabel("Family or Household Name").fill(name);
    await page.getByTestId("create-family-submit").click();
    await expect.poll(() => new URL(page.url()).pathname).toBe(SETTINGS_PATH);
  },
);

Then(
  "{string} is saved with the {string} accent colour and the {string} space purpose",
  async ({ world }, name: string, accent: string, purpose: string) => {
    const response = await world.api.get("/api/families", {
      headers: bearer(memberSessionOf(world)),
      failOnStatusCode: false,
    });
    const families = ((await response.json()) as { families: SavedSpace[] }).families;
    expect(families.find((family) => family.name === name)).toMatchObject({
      accent: accent.toLowerCase(),
      purpose: purpose.toLowerCase(),
    });
  },
);

When("I open the create family space screen", async ({ page }) => {
  await openCreateSpace(page);
});

When("I try to create a family space with an empty name", async ({ page }) => {
  await openCreateSpace(page);
  await page.getByTestId("create-family-submit").click();
});

When(
  "I choose the {string} accent colour and the {string} space purpose",
  async ({ page }, accent: string, purpose: string) => {
    await page.getByRole("button", { name: accentLabel(accent), exact: true }).click();
    await page.getByRole("radio", { name: new RegExp(`^${purpose}`) }).click();
  },
);

Then(
  "the {string} accent colour and the {string} space purpose are selected",
  async ({ page }, accent: string, purpose: string) => {
    await expect(
      page.getByRole("button", { name: accentLabel(accent), exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("radio", { name: new RegExp(`^${purpose}`) })).toBeChecked();
  },
);

Then("I am not asked for a plan or payment", async ({ page }) => {
  await expect(page.getByRole("heading", { name: CREATE_HEADING })).toBeVisible();
  await expect(page.getByText(/\b(plan|payment)\b/i)).toHaveCount(0);
});

Then(
  "{string} appears in my family and spaces settings with the role {string}",
  async ({ page }, name: string, role: string) => {
    await openSettings(page);
    await expectRoleIn(page, name, role);
  },
);

When("I open the home page", async ({ page }) => {
  await page.goto(`${webBaseUrl()}/`);
  await expect(page.getByTestId(SPACE_LIST)).toBeVisible();
});

When("I open family and spaces settings", async ({ page }) => {
  await openSettings(page);
});

Then("I see {string} with the role {string}", async ({ page }, name: string, role: string) => {
  await expectRoleIn(page, name, role);
});

When("I switch to {string}", async ({ page }, name: string) => {
  await spaceRow(page, name).getByTestId("family-space-switch").click();
});

Then("{string} is the family I act in", async ({ page }, name: string) => {
  await expect(spaceRow(page, name)).toContainText("Active");
});

When("I leave {string}", async ({ page }, name: string) => {
  await spaceRow(page, name).getByTestId("family-space-leave").click();
});

When("I try to leave {string}", async ({ page }, name: string) => {
  await spaceRow(page, name).getByTestId("family-space-leave").click();
});

Then(
  "{string} no longer appears in my family and spaces settings",
  async ({ page }, name: string) => {
    await expect(page.getByTestId(SPACE_LIST)).toBeVisible();
    await expect(spaceRow(page, name)).toHaveCount(0);
  },
);
