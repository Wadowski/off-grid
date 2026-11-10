// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { bearer, memberSessionOf, sessionOf } from "../support/family-sessions.js";

const { Given, When, Then } = createBdd(test);

type MemberEntry = { userId: string; displayName: string | null };

const familyIdNamed = (world: ScenarioWorld, name: string): string => {
  const family = world.families.find((created) => created.name === name);
  expect(family, `family "${name}" was not created`).toBeDefined();
  return family?.id ?? "";
};

const rememberPerson = (world: ScenarioWorld, displayName: string, session: Session): void => {
  world.otherPeople = { ...world.otherPeople, [displayName]: session };
  world.lastOtherPerson = displayName;
};

const lastPerson = (world: ScenarioWorld): Session => {
  const session = world.lastOtherPerson && world.otherPeople?.[world.lastOtherPerson];
  if (!session) {
    throw new Error("No other person has been set up in this scenario.");
  }
  return session;
};

const membersOf = async (world: ScenarioWorld, familyId: string): Promise<MemberEntry[]> => {
  const response = await world.api.get(`/api/families/${familyId}/members`, {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(200);
  return ((await response.json()) as { members: MemberEntry[] }).members;
};

const namesIn = async (world: ScenarioWorld, familyName: string): Promise<(string | null)[]> =>
  (await membersOf(world, familyIdNamed(world, familyName))).map((member) => member.displayName);

const ownDisplayNameOf = (world: ScenarioWorld): string => {
  const name = world.ownAccount?.displayName;
  expect(name, "the signed-in person has no display name").toBeDefined();
  return name ?? "";
};

Given(
  "another user with the display name {string} joins {string} as a member",
  async ({ world }, displayName: string, familyName: string) => {
    const person = await sessionOf(world.api, displayName);
    const invitation = await world.api.post(
      `/api/families/${familyIdNamed(world, familyName)}/invitations`,
      { headers: bearer(memberSessionOf(world)), failOnStatusCode: false },
    );
    expect(invitation.status()).toBe(201);
    const { code } = (await invitation.json()) as { code: string };
    const joined = await world.api.post("/api/families/join", {
      headers: bearer(person),
      data: { code },
      failOnStatusCode: false,
    });
    expect(joined.status()).toBe(201);
    rememberPerson(world, displayName, person);
  },
);

Given(
  "another user with the display name {string} has a family named {string}",
  async ({ world }, displayName: string, familyName: string) => {
    const owner = await sessionOf(world.api, displayName);
    const response = await world.api.post("/api/families", {
      headers: bearer(owner),
      data: { name: familyName },
      failOnStatusCode: false,
    });
    expect(response.status()).toBe(201);
    world.families.push((await response.json()) as { id: string; name: string });
    rememberPerson(world, displayName, owner);
  },
);

When("that user changes their display name to {string}", async ({ world }, displayName: string) => {
  const response = await world.api.patch("/api/me", {
    headers: bearer(lastPerson(world)),
    data: { displayName },
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
});

When("that user leaves {string}", async ({ world }, familyName: string) => {
  const person = lastPerson(world);
  const response = await world.api.delete(
    `/api/families/${familyIdNamed(world, familyName)}/members/${person.userId}`,
    { headers: bearer(person), failOnStatusCode: false },
  );
  expect(response.status()).toBe(204);
});

Then(
  "I see the display names {string} and my own display name in {string}",
  async ({ world }, displayName: string, familyName: string) => {
    const ownName = ownDisplayNameOf(world);
    await eventually(async () => {
      expect(await namesIn(world, familyName)).toEqual(
        expect.arrayContaining([displayName, ownName]),
      );
    });
  },
);

Then(
  "I see the display name {string} and not {string} in {string}",
  async ({ world }, newName: string, oldName: string, familyName: string) => {
    await eventually(async () => {
      const names = await namesIn(world, familyName);
      expect(names).toContain(newName);
      expect(names).not.toContain(oldName);
    });
  },
);

Then(
  "I cannot see the display name {string} anywhere in my families",
  async ({ world }, displayName: string) => {
    const response = await world.api.get("/api/families", {
      headers: bearer(memberSessionOf(world)),
      failOnStatusCode: false,
    });
    const { families } = (await response.json()) as { families: { id: string }[] };
    for (const family of families) {
      const names = (await membersOf(world, family.id)).map((member) => member.displayName);
      expect(names).not.toContain(displayName);
    }
  },
);

Then(
  "I do not see the display name {string} in {string}",
  async ({ world }, displayName: string, familyName: string) => {
    expect(await namesIn(world, familyName)).not.toContain(displayName);
  },
);
