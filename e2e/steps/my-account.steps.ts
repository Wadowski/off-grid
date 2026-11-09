// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { expect, type APIRequestContext, type APIResponse } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";
import {
  completePasswordReset,
  NEW_PASSWORD,
  signInWith,
  type Session,
} from "../support/factories/instance-admin.js";
import { STRONG_PASSWORD } from "../support/factories/identity.js";
import { signedInPerson, type SignedInPerson } from "../support/factories/notifications.js";

const { Given, When, Then } = createBdd(test);

const WRONG_PASSWORD = "not the right password";
const SHORT_PASSWORD = "short";
const EMPTY_DISPLAY_NAME = "";
const KOWALSKA_NAME = "Anna Kowalska";

type SessionView = { id: string; current: boolean };

const bearer = (session: Session): Record<string, string> => ({
  authorization: `Bearer ${session.accessToken}`,
});

const annaOf = (world: ScenarioWorld): SignedInPerson => {
  const anna = world.people?.anna;
  if (anna === undefined) {
    throw new Error("Anna is not signed in in this scenario.");
  }
  return anna;
};

const annaPhoneOf = (world: ScenarioWorld): SignedInPerson => {
  const phone = world.people?.annaPhone;
  if (phone === undefined) {
    throw new Error("Anna has no second device in this scenario.");
  }
  return phone;
};

const benOf = (world: ScenarioWorld): SignedInPerson => {
  const ben = world.people?.ben;
  if (ben === undefined) {
    throw new Error("Ben is not signed in in this scenario.");
  }
  return ben;
};

const createFamilyFor = async (
  api: APIRequestContext,
  session: Session,
  name: string,
): Promise<void> => {
  const response = await api.post("/api/families", {
    headers: bearer(session),
    data: { name },
    failOnStatusCode: false,
  });
  expect(response.status(), "could not create the family").toBe(201);
};

const endOtherSessions = async (api: APIRequestContext, session: Session): Promise<void> => {
  const response = await api.post("/api/me/sessions/sign-out-others", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
};

const recordResponse = async (world: ScenarioWorld, response: APIResponse): Promise<void> => {
  world.response = {
    status: response.status(),
    body: await response.json().catch(() => undefined),
  };
};

const signInSecondDevice = async (
  api: APIRequestContext,
  person: SignedInPerson,
): Promise<SignedInPerson> => {
  const { session } = await signInWith(api, person.email, person.password);
  if (session === undefined) {
    throw new Error(`${person.email} cannot sign in on a second device`);
  }
  return { ...person, session };
};

const sessionsOf = async (api: APIRequestContext, session: Session): Promise<SessionView[]> => {
  const response = await api.get("/api/me/sessions", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  expect(response.status(), "could not list sessions").toBe(200);
  return ((await response.json()) as { sessions: SessionView[] }).sessions;
};

const currentSessionIdOf = async (api: APIRequestContext, session: Session): Promise<string> => {
  const current = (await sessionsOf(api, session)).find((listed) => listed.current);
  if (current === undefined) {
    throw new Error("The session list does not mark a current session.");
  }
  return current.id;
};

const isSessionLive = async (api: APIRequestContext, session: Session): Promise<boolean> => {
  const response = await api.get("/api/me/sessions", {
    headers: bearer(session),
    failOnStatusCode: false,
  });
  return response.status() === 200;
};

const changePassword = (
  api: APIRequestContext,
  session: Session,
  currentPassword: string,
  newPassword: string,
): Promise<APIResponse> =>
  api.post("/api/me/password", {
    headers: bearer(session),
    data: { currentPassword, newPassword },
    failOnStatusCode: false,
  });

const passwordWorks = async (
  api: APIRequestContext,
  email: string,
  password: string,
): Promise<boolean> => {
  const { status } = await signInWith(api, email, password);
  return status === 200;
};

Given("Anna is signed in and belongs to two families", async ({ world }) => {
  world.people ??= {};
  const anna = await signedInPerson(world.api, "Anna");
  world.people.anna = anna;
  await createFamilyFor(world.api, anna.session, "Annas family");
  await createFamilyFor(world.api, anna.session, "Annas second family");
});

Given("Anna is signed in on a laptop and a phone", async ({ world }) => {
  world.people ??= {};
  const anna = await signedInPerson(world.api, "Anna");
  world.people.anna = anna;
  await endOtherSessions(world.api, anna.session);
  world.people.annaPhone = await signInSecondDevice(world.api, anna);
});

Given("Ben is signed in on his own laptop", async ({ world }) => {
  world.people ??= {};
  world.people.ben = await signedInPerson(world.api, "Ben");
});

When("she opens her profile", async ({ world }) => {
  const response = await world.api.get("/api/me", {
    headers: bearer(annaOf(world).session),
    failOnStatusCode: false,
  });
  world.response = { status: response.status(), body: await response.json() };
});

Then("she sees her name, email, role and both families", async ({ world }) => {
  const anna = annaOf(world);
  expect(world.response?.status).toBe(200);
  expect(world.response?.body).toMatchObject({ displayName: "Anna", email: anna.email });
  const families = await world.api.get("/api/families", {
    headers: bearer(anna.session),
    failOnStatusCode: false,
  });
  const names = ((await families.json()) as { families: { name: string }[] }).families.map(
    (family) => family.name,
  );
  expect(names).toEqual(expect.arrayContaining(["Annas family", "Annas second family"]));
});

When("she changes her display name to Anna Kowalska", async ({ world }) => {
  const response = await world.api.patch("/api/me", {
    headers: bearer(annaOf(world).session),
    data: { displayName: KOWALSKA_NAME },
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
});

Then("her profile shows Anna Kowalska", async ({ world }) => {
  const response = await world.api.get("/api/me", {
    headers: bearer(annaOf(world).session),
    failOnStatusCode: false,
  });
  expect(await response.json()).toMatchObject({ displayName: KOWALSKA_NAME });
});

When("she changes her display name to an empty name", async ({ world }) => {
  const response = await world.api.patch("/api/me", {
    headers: bearer(annaOf(world).session),
    data: { displayName: EMPTY_DISPLAY_NAME },
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("her display name is unchanged", async ({ world }) => {
  const response = await world.api.get("/api/me", {
    headers: bearer(annaOf(world).session),
    failOnStatusCode: false,
  });
  expect(await response.json()).toMatchObject({ displayName: "Anna" });
});

When("Anna changes her password giving the right current password", async ({ world }) => {
  const anna = annaOf(world);
  const response = await changePassword(world.api, anna.session, anna.password, NEW_PASSWORD);
  expect(response.status()).toBe(204);
});

Then("the new password works for sign-in", async ({ world }) => {
  expect(await passwordWorks(world.api, annaOf(world).email, NEW_PASSWORD)).toBe(true);
});

Then("her other sessions are signed out", async ({ world }) => {
  expect(await isSessionLive(world.api, annaPhoneOf(world).session)).toBe(false);
});

Then("her current session stays valid", async ({ world }) => {
  expect(await isSessionLive(world.api, annaOf(world).session)).toBe(true);
});

When(
  "Anna tries to change her password to one that breaks the password rules",
  async ({ world }) => {
    const anna = annaOf(world);
    const response = await changePassword(world.api, anna.session, anna.password, SHORT_PASSWORD);
    await recordResponse(world, response);
  },
);

Then("her password is unchanged", async ({ world }) => {
  expect(await passwordWorks(world.api, annaOf(world).email, STRONG_PASSWORD)).toBe(true);
});

When("Anna tries to change her password with a wrong current password", async ({ world }) => {
  const anna = annaOf(world);
  const response = await changePassword(world.api, anna.session, WRONG_PASSWORD, NEW_PASSWORD);
  await recordResponse(world, response);
});

Then("she sees both sessions and the current one is marked", async ({ world }) => {
  const sessions = await sessionsOf(world.api, annaOf(world).session);
  expect(sessions).toHaveLength(2);
  expect(sessions.filter((listed) => listed.current)).toHaveLength(1);
});

When("she ends the session on the phone", async ({ world }) => {
  const phoneId = await currentSessionIdOf(world.api, annaPhoneOf(world).session);
  const response = await world.api.delete(`/api/me/sessions/${phoneId}`, {
    headers: bearer(annaOf(world).session),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
});

Then("the phone session no longer works", async ({ world }) => {
  expect(await isSessionLive(world.api, annaPhoneOf(world).session)).toBe(false);
});

When("Anna chooses to sign out of all other sessions", async ({ world }) => {
  const response = await world.api.post("/api/me/sessions/sign-out-others", {
    headers: bearer(annaOf(world).session),
    failOnStatusCode: false,
  });
  expect(response.status()).toBe(204);
});

Then("only the current session stays valid", async ({ world }) => {
  expect(await isSessionLive(world.api, annaOf(world).session)).toBe(true);
  expect(await isSessionLive(world.api, annaPhoneOf(world).session)).toBe(false);
});

When("Anna tries to end Ben's session", async ({ world }) => {
  const benSessionId = await currentSessionIdOf(world.api, benOf(world).session);
  const response = await world.api.delete(`/api/me/sessions/${benSessionId}`, {
    headers: bearer(annaOf(world).session),
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("Ben's session still works", async ({ world }) => {
  expect(await isSessionLive(world.api, benOf(world).session)).toBe(true);
});

When("Anna regenerates her recovery code with her password", async ({ world }) => {
  const anna = annaOf(world);
  const response = await world.api.post("/api/me/recovery-code", {
    headers: bearer(anna.session),
    data: { password: anna.password },
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("she sees the new code once", ({ world }) => {
  expect(world.response?.status).toBe(201);
  expect((world.response?.body as { recoveryCode?: unknown }).recoveryCode).toEqual(
    expect.any(String),
  );
});

Then("the old code no longer works", async ({ world }) => {
  const anna = annaOf(world);
  const response = await completePasswordReset(
    world.api,
    anna.email,
    anna.recoveryCode ?? "",
    NEW_PASSWORD,
  );
  expect(response.status()).not.toBe(200);
});

When("Anna tries to regenerate her recovery code with a wrong password", async ({ world }) => {
  const response = await world.api.post("/api/me/recovery-code", {
    headers: bearer(annaOf(world).session),
    data: { password: WRONG_PASSWORD },
    failOnStatusCode: false,
  });
  await recordResponse(world, response);
});

Then("her recovery code is unchanged", ({ world }) => {
  expect(world.response?.status).toBe(403);
  expect(world.response?.body).not.toHaveProperty("recoveryCode");
});
