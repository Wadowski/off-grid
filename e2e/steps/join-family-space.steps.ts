// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type Page } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import { bearer, memberSessionOf } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";
import { signInThroughUi } from "../support/web-session.js";

const { Given, When, Then } = createBdd(test);

const JOIN_PATH = "/families/join";
const SETTINGS_PATH = "/settings/families";
const CODE_FORM = "join-family-code-form";
const CONTINUE = "Continue";
const ACCEPT = "Accept invitation & join space";
const DECLINE = "Decline";
const CODE_LABEL = "Invitation code";
const WRONG_CODE = "wrong-code";

// Signing in through the browser happens once per page, on the first join step.
const signedInPages = new WeakSet<Page>();

const openJoinScreen = async (page: Page, world: ScenarioWorld): Promise<void> => {
  if (!signedInPages.has(page)) {
    signedInPages.add(page);
    await signInThroughUi(page, requireOwnAccount(world));
  }
  await page.goto(`${webBaseUrl()}${JOIN_PATH}`);
  await expect(page.getByTestId(CODE_FORM)).toBeVisible();
};

const enterCode = async (page: Page, code: string): Promise<void> => {
  await page.getByRole("textbox", { name: CODE_LABEL }).fill(code);
  await page.getByRole("button", { name: CONTINUE }).click();
};

const requireOwnAccount = (world: ScenarioWorld): NonNullable<ScenarioWorld["ownAccount"]> => {
  if (world.ownAccount === undefined) {
    throw new Error("No signed-in person is set up for this scenario.");
  }
  return world.ownAccount;
};

const requireFamilyOwner = (world: ScenarioWorld): NonNullable<ScenarioWorld["familyOwner"]> => {
  if (world.familyOwner === undefined) {
    throw new Error("The family owner is not set up for this scenario.");
  }
  return world.familyOwner;
};

const requireInviterName = (world: ScenarioWorld): string => {
  if (world.inviterDisplayName === undefined) {
    throw new Error("The inviter is not set up for this scenario.");
  }
  return world.inviterDisplayName;
};

const requireInvitationCode = (world: ScenarioWorld): string => {
  if (world.invitationCode === undefined) {
    throw new Error("No invitation has been created in this scenario.");
  }
  return world.invitationCode;
};

Given("that user has invited me with a code to {string}", async ({ world }, name: string) => {
  const family = world.families.find((created) => created.name === name);
  if (family === undefined) {
    throw new Error(`family "${name}" was not created`);
  }
  const owner = requireFamilyOwner(world);

  const invitation = await world.api.post(`/api/families/${family.id}/invitations`, {
    headers: bearer(owner),
    failOnStatusCode: false,
  });
  expect(invitation.status(), "the invitation was not created").toBe(201);
  const { invitationId, code } = (await invitation.json()) as {
    invitationId: string;
    code: string;
  };
  world.invitationId = invitationId;
  world.invitationCode = code;
  world.invitationFamilyId = family.id;

  // The inviter's name reaches the family module through an event, so wait for it.
  await eventually(async () => {
    const members = await world.api.get(`/api/families/${family.id}/members`, {
      headers: bearer(owner),
      failOnStatusCode: false,
    });
    const body = (await members.json()) as { members: { displayName: string | null }[] };
    expect(body.members.map((member) => member.displayName)).toContain(world.inviterDisplayName);
  });
});

When("I enter the invitation code on the join family space screen", async ({ page, world }) => {
  await openJoinScreen(page, world);
  await enterCode(page, requireInvitationCode(world));
  await expect(page.getByRole("button", { name: ACCEPT })).toBeVisible();
});

When(
  "I enter the invitation code {string} on the join family space screen",
  async ({ page, world }, code: string) => {
    await openJoinScreen(page, world);
    await enterCode(page, code);
  },
);

When(
  "I enter a wrong invitation code {int} times on the join family space screen",
  async ({ page, world }, times: number) => {
    await openJoinScreen(page, world);
    for (let attempt = 0; attempt < times; attempt += 1) {
      await enterCode(page, WRONG_CODE);
      await expect(page.getByRole("alert")).toBeVisible();
    }
  },
);

When("I try one more code on the join family space screen", async ({ page }) => {
  await enterCode(page, "one-more-code");
});

When("I continue on the join family space screen without a code", async ({ page, world }) => {
  await openJoinScreen(page, world);
  await page.getByRole("button", { name: CONTINUE }).click();
});

When("I open the join family space screen", async ({ page, world }) => {
  await openJoinScreen(page, world);
});

When("I accept the invitation", async ({ page }) => {
  await page.getByRole("button", { name: ACCEPT }).click();
  await expect.poll(() => new URL(page.url()).pathname).toBe(SETTINGS_PATH);
});

When("I decline the invitation", async ({ page }) => {
  await page.getByRole("button", { name: DECLINE }).click();
});

Then("I see the family name {string}", async ({ page }, name: string) => {
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
});

Then("I see that the invitation came from that user", async ({ page, world }) => {
  await expect(
    page.getByText(`${requireInviterName(world)} invited you to join`, { exact: false }),
  ).toBeVisible();
});

Then("I am back at the code step", async ({ page }) => {
  await expect(page.getByTestId(CODE_FORM)).toBeVisible();
});

Then("I am not a member of {string} yet", async ({ world }, name: string) => {
  const response = await world.api.get("/api/families", {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  const families = ((await response.json()) as { families: { name: string }[] }).families;
  expect(families.map((family) => family.name)).not.toContain(name);
});

Then("{string} is my active family", async ({ page }, name: string) => {
  await page.goto(`${webBaseUrl()}${SETTINGS_PATH}`);
  const row = page.getByTestId("family-space-row").filter({ hasText: name });
  await expect(row).toContainText("Active");
});
