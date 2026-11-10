// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { APIRequestContext, APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { eventually } from "../support/eventually.js";
import type { Session } from "../support/factories/instance-admin.js";
import { expect, test, type ScenarioWorld } from "../support/fixtures.js";
import { bearer, memberSessionOf, sessionOf } from "../support/family-sessions.js";

const { Given, When, Then } = createBdd(test);

const LONG_NAME_LENGTH = 101;
const NOT_FOUND_CODE = "NOT_FOUND";
const VALIDATION_CODE = "VALIDATION_FAILED";
const LAST_ADMIN_CODE = "LAST_ADMIN";

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  world.response = {
    status: response.status(),
    body: await response.json().catch(() => undefined),
  };
};

const familyIdNamed = (world: ScenarioWorld, name: string): string => {
  const family = world.families.find((created) => created.name === name);
  expect(family, `family "${name}" was not created`).toBeDefined();
  return family?.id ?? "";
};

const postFamily = (api: APIRequestContext, session: Session, name: string): Promise<APIResponse> =>
  api.post("/api/families", { headers: bearer(session), data: { name }, failOnStatusCode: false });

const familyNamesOf = async (api: APIRequestContext, session: Session): Promise<string[]> => {
  const response = await api.get("/api/families", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  return ((await response.json()) as { families: { name: string }[] }).families.map(
    (family) => family.name,
  );
};

Given("I am a user without any family", async ({ world }) => {
  const session = await sessionOf(world.api, "Ben Member");
  world.userId = session.userId;
  world.memberAccessToken = session.accessToken;
});

Given("another user has a family named {string}", async ({ world }, name: string) => {
  const owner = await sessionOf(world.api, "Other Person");
  const response = await postFamily(world.api, owner, name);
  expect(response.status()).toBe(201);
  world.families.push((await response.json()) as { id: string; name: string });
});

When("I create a family named {string}", async ({ world }, name: string) => {
  const response = await postFamily(world.api, memberSessionOf(world), name);
  await recordResponse(world, response);
  if (response.status() === 201) {
    world.families.push((await response.json()) as { id: string; name: string });
  }
});

When("I try to create a family with an empty name", async ({ world }) => {
  await recordResponse(world, await postFamily(world.api, memberSessionOf(world), ""));
});

When("I try to create a family with a name that is 101 characters long", async ({ world }) => {
  const name = "a".repeat(LONG_NAME_LENGTH);
  await recordResponse(world, await postFamily(world.api, memberSessionOf(world), name));
});

When("I ask for the family {string} by its identifier", async ({ world }, name: string) => {
  const response = await world.api.get(`/api/families/${familyIdNamed(world, name)}`, {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("{string} appears in my list of families", async ({ world }, name: string) => {
  expect(await familyNamesOf(world.api, memberSessionOf(world))).toContain(name);
});

Then("{string} eventually appears in my list of families", async ({ world }, name: string) => {
  const session = memberSessionOf(world);
  await eventually(async () => {
    expect(await familyNamesOf(world.api, session)).toContain(name);
  });
});

Then("I am told that the family name is required", ({ world }) => {
  expect(world.response?.status).toBe(400);
  expect(world.response?.body).toMatchObject({ code: VALIDATION_CODE });
});

Then("I am told that the family name is too long", ({ world }) => {
  expect(world.response?.status).toBe(400);
  expect(world.response?.body).toMatchObject({ code: VALIDATION_CODE });
});

Then("I am told that the family was not found", ({ world }) => {
  expect(world.response?.status).toBe(404);
  expect(world.response?.body).toMatchObject({ code: NOT_FOUND_CODE });
});

When("I ask for the members of {string}", async ({ world }, name: string) => {
  const response = await world.api.get(`/api/families/${familyIdNamed(world, name)}/members`, {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

When(
  "I try to change my own role to {string} in {string}",
  async ({ world }, role: string, name: string) => {
    const session = memberSessionOf(world);
    const response = await world.api.patch(
      `/api/families/${familyIdNamed(world, name)}/members/${session.userId}`,
      { headers: bearer(session), data: { role }, failOnStatusCode: false },
    );
    await recordResponse(world, response);
  },
);

When("I try to remove myself from {string}", async ({ world }, name: string) => {
  const session = memberSessionOf(world);
  const response = await world.api.delete(
    `/api/families/${familyIdNamed(world, name)}/members/${session.userId}`,
    { headers: bearer(session), failOnStatusCode: false },
  );
  await recordResponse(world, response);
});

Then("I see 1 member, who is an admin", ({ world }) => {
  expect(world.response?.status).toBe(200);
  expect(world.response?.body).toMatchObject({
    members: [{ userId: world.userId, role: "admin" }],
  });
});

Then("I am told that a family must keep at least one admin", ({ world }) => {
  expect(world.response?.status).toBe(409);
  expect(world.response?.body).toMatchObject({ code: LAST_ADMIN_CODE });
});

const RATE_LIMITED_CODE = "RATE_LIMITED";
const ACCESS_DENIED_CODE = "ACCESS_DENIED";
const WRONG_CODE = "wrong-code";

const requireInvitationCode = (world: ScenarioWorld): string => {
  if (world.invitationCode === undefined) {
    throw new Error("No invitation has been created in this scenario.");
  }
  return world.invitationCode;
};

const newJoinerSession = async (world: ScenarioWorld): Promise<Session> => {
  const session = await sessionOf(world.api, "New Joiner");
  world.joinerSession = session;
  return session;
};

const redeemAs = async (world: ScenarioWorld, session: Session, code: string): Promise<void> => {
  const response = await world.api.post("/api/families/join", {
    headers: bearer(session),
    data: { code },
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
};

const redeemWithNewUser = async (world: ScenarioWorld, code: string): Promise<void> => {
  await redeemAs(world, await newJoinerSession(world), code);
};

const joinerSessionOf = (world: ScenarioWorld): Session => {
  if (world.joinerSession === undefined) {
    throw new Error("No new user has been set up for this scenario.");
  }
  return world.joinerSession;
};

const createInvitationFor = async (world: ScenarioWorld, name: string): Promise<void> => {
  const familyId = familyIdNamed(world, name);
  const response = await world.api.post(`/api/families/${familyId}/invitations`, {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
  if (response.status() === 201) {
    const invitation = (await response.json()) as { invitationId: string; code: string };
    world.invitationId = invitation.invitationId;
    world.invitationCode = invitation.code;
    world.invitationFamilyId = familyId;
  }
};

When("I create an invitation to {string}", async ({ world }, name: string) => {
  await createInvitationFor(world, name);
});

When("I revoke the invitation", async ({ world }) => {
  const response = await world.api.delete(
    `/api/families/${world.invitationFamilyId}/invitations/${world.invitationId}`,
    { headers: bearer(memberSessionOf(world)), failOnStatusCode: false },
  );
  await recordResponse(world, response);
});

Given("a new user has joined {string} with an invitation", async ({ world }, name: string) => {
  await createInvitationFor(world, name);
  expect(world.invitationCode, "the invitation was not created").toBeDefined();
  await redeemWithNewUser(world, requireInvitationCode(world));
});

When(
  /^(?:a|another) new user (?:tries to )?redeems? the (?:same )?invitation code$/,
  async ({ world }) => {
    await redeemWithNewUser(world, requireInvitationCode(world));
  },
);

When("a new user tries to redeem the code {string}", async ({ world }, code: string) => {
  await redeemWithNewUser(world, code);
});

When(
  "a new user tries to redeem a wrong invitation code {int} times",
  async ({ world }, times: number) => {
    const session = await newJoinerSession(world);
    for (let attempt = 0; attempt < times; attempt += 1) {
      await redeemAs(world, session, WRONG_CODE);
    }
  },
);

When("the new user tries to create an invitation to {string}", async ({ world }, name: string) => {
  const response = await world.api.post(`/api/families/${familyIdNamed(world, name)}/invitations`, {
    headers: bearer(joinerSessionOf(world)),
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("the next redemption attempt is refused because of too many attempts", async ({ world }) => {
  await redeemAs(world, joinerSessionOf(world), WRONG_CODE);
  expect(world.response?.status).toBe(429);
  expect(world.response?.body).toMatchObject({ code: RATE_LIMITED_CODE });
});

Then("I am told that the invitation code is not valid", ({ world }) => {
  expect(world.response?.status).toBe(404);
  expect(world.response?.body).toMatchObject({ code: NOT_FOUND_CODE });
});

Then("I am told that I am not allowed to do that", ({ world }) => {
  expect(world.response?.status).toBe(403);
  expect(world.response?.body).toMatchObject({ code: ACCESS_DENIED_CODE });
});

Then("the new user is a member of {string}", ({ world }, name: string) => {
  expect(world.response?.status).toBe(201);
  expect(world.response?.body).toMatchObject({ familyId: familyIdNamed(world, name) });
});

Then("the new user is listed as a member, not an admin", async ({ world }) => {
  const joiner = joinerSessionOf(world);
  const familyId = world.invitationFamilyId;
  if (familyId === undefined) {
    throw new Error("No invitation family is set up for this scenario.");
  }
  const response = await world.api.get(`/api/families/${familyId}/members`, {
    headers: bearer(memberSessionOf(world)),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(200);
  expect(await response.json()).toMatchObject({
    members: expect.arrayContaining([{ userId: joiner.userId, role: "member" }]),
  });
});
