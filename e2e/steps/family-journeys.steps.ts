// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { accountSessionOf, bearer } from "../support/family-sessions.js";
import { webBaseUrl } from "../support/stack.js";
import { signInThroughUi } from "../support/web-session.js";

const { When, Then } = createBdd(test);

const JOIN_PATH = "/families/join";
const SETTINGS_PATH = "/settings/families";
const CODE_LABEL = "Invitation code";
const CONTINUE = "Continue";
const ACCEPT = "Accept invitation & join space";

const familyIdNamed = (world: ScenarioWorld, name: string): string => {
  const family = world.families.find((created) => created.name === name);
  expect(family, `family "${name}" was not created`).toBeDefined();
  return family?.id ?? "";
};

const sessionOfPerson = (world: ScenarioWorld, displayName: string): Session => {
  const session = world.otherPeople?.[displayName];
  expect(session, `${displayName} was not set up in this scenario`).toBeDefined();
  return session as Session;
};

When(
  "a new member named {string} joins with the invitation code from the invite dialog",
  async ({ browser, world }, displayName: string) => {
    const code = world.invitationCode;
    expect(code, "no invitation code was shown in the invite dialog").toBeTruthy();

    // A separate browser context keeps the admin's page signed in as the admin.
    const { account } = await accountSessionOf(world.api, displayName);
    const context = await browser.newContext();
    try {
      const joiner = await context.newPage();
      await signInThroughUi(joiner, account);
      await joiner.goto(`${webBaseUrl()}${JOIN_PATH}`);
      await joiner.getByRole("textbox", { name: CODE_LABEL }).fill(code ?? "");
      await joiner.getByRole("button", { name: CONTINUE }).click();
      await joiner.getByRole("button", { name: ACCEPT }).click();
      await expect.poll(() => new URL(joiner.url()).pathname).toBe(SETTINGS_PATH);
    } finally {
      await context.close();
    }
  },
);

Then(
  "{string} sees their own role in {string} as {string}",
  async ({ world }, displayName: string, familyName: string, role: string) => {
    const person = sessionOfPerson(world, displayName);
    const familyId = familyIdNamed(world, familyName);

    await eventually(async () => {
      const response = await world.api.get(`/api/families/${familyId}/members`, {
        headers: bearer(person),
        failOnStatusCode: false,
      });
      expect(response.status()).toBe(200);
      const { members } = (await response.json()) as {
        members: { userId: string; role: string }[];
      };
      expect(members.find((member) => member.userId === person.userId)?.role).toBe(
        role.toLowerCase(),
      );
    });
  },
);

When(
  "{string} asks for the members of {string}",
  async ({ world }, displayName: string, familyName: string) => {
    const response = await world.api.get(
      `/api/families/${familyIdNamed(world, familyName)}/members`,
      {
        headers: bearer(sessionOfPerson(world, displayName)),
        failOnStatusCode: false,
      },
    );
    world.response = {
      status: response.status(),
      body: await response.json().catch(() => undefined),
    };
  },
);
