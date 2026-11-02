// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string, world: ScenarioWorld): never => {
  const signedIn = world.userId === undefined ? "no user yet" : "a user is set up";
  throw new Error(`Step not implemented yet (OG-49 follow-up, ${signedIn}): ${step}`);
};

When("a request without a session reaches a protected endpoint", ({ world }) =>
  notImplemented("a request without a session reaches a protected endpoint", world),
);
Then("it is refused with {string}", ({ world }, code: string) =>
  notImplemented(`it is refused with "${code}"`, world),
);
When("anyone calls the health endpoint", ({ world }) =>
  notImplemented("anyone calls the health endpoint", world),
);
Then("it responds without a session", ({ world }) =>
  notImplemented("it responds without a session", world),
);
When("she creates the family {string}", ({ world }, name: string) =>
  notImplemented(`she creates the family "${name}"`, world),
);
Then("Anna is its first member", ({ world }) => notImplemented("Anna is its first member", world));
Given("Anna belongs to {string} and {string}", ({ world }, first: string, second: string) =>
  notImplemented(`Anna belongs to "${first}" and "${second}"`, world),
);
When("she opens {string} data while acting in that family", ({ world }, name: string) =>
  notImplemented(`she opens "${name}" data while acting in that family`, world),
);
Then("the request succeeds with that family's context", ({ world }) =>
  notImplemented("the request succeeds with that family's context", world),
);
Given("Anna has created the family {string}", ({ world }, name: string) =>
  notImplemented(`Anna has created the family "${name}"`, world),
);
When("Anna sends a request acting in {string}", ({ world }, name: string) =>
  notImplemented(`Anna sends a request acting in "${name}"`, world),
);
Given("Anna was removed from {string}", ({ world }, name: string) =>
  notImplemented(`Anna was removed from "${name}"`, world),
);
When("she sends a request acting in {string}", ({ world }, name: string) =>
  notImplemented(`she sends a request acting in "${name}"`, world),
);
Then("it is refused even though her session is still valid", ({ world }) =>
  notImplemented("it is refused even though her session is still valid", world),
);
