// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notServed = (_world: ScenarioWorld, ...details: unknown[]): never => {
  throw new Error(
    `The e2e stack does not serve the web app yet, so the create account screen step cannot run: ${details.join(", ")}.`,
  );
};

Given("I am on the create account page", ({ world }) => notServed(world));
When("I open the create account page", ({ world }) => notServed(world));
When(
  "I fill in my name, email, password and confirmation and press {string}",
  ({ world }, label: string) => notServed(world, label),
);
When("I type a short password", ({ world }) => notServed(world));
When("the confirmation does not match the password", ({ world }) => notServed(world));
When("I create an account with {string}", ({ world }, email: string) => notServed(world, email));
Then("after creating my account I am the admin", ({ world }) => notServed(world));
Then("I see my recovery code", ({ world }) => notServed(world));
Then("the strength meter shows that it is too weak and says why", ({ world }) => notServed(world));
Then("I see {string} and no account is created", ({ world }, message: string) =>
  notServed(world, message),
);
Then("I am told the email is already in use", ({ world }) => notServed(world));
Then("{string} is disabled until I tick {string}", ({ world }, button: string, box: string) =>
  notServed(world, button, box),
);
Then("I can copy the code or download it as a text file", ({ world }) => notServed(world));
Then("I see that new accounts are not accepted and a link to sign in", ({ world }) =>
  notServed(world),
);
