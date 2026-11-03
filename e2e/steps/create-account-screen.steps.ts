// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

const notServed = (_world: ScenarioWorld, ...details: unknown[]): never => {
  throw new Error(
    `The e2e stack does not serve the web app yet, so the create account screen step cannot run: ${details.join(", ")}.`,
  );
};

When("I open the create account page", ({ world }) => notServed(world));
When(
  "I fill in my name, email, password and confirmation and press {string}",
  ({ world }, label: string) => notServed(world, label),
);
When("I type a short password", ({ world }) => notServed(world));
When("the confirmation does not match the password", ({ world }) => notServed(world));
When("I create an account with {string}", ({ world }, email: string) => notServed(world, email));
When("I tick {string}", ({ world }, box: string) => notServed(world, box));
When("I press {string}", ({ world }, button: string) => notServed(world, button));
Then("after creating my account I am the admin", ({ world }) => notServed(world));
Then("the new account has the user role", ({ world }) => notServed(world));
Then("I see my recovery code", ({ world }) => notServed(world));
Then("the strength meter shows that it is too weak and says why", ({ world }) => notServed(world));
Then("I see {string} and no account is created", ({ world }, message: string) =>
  notServed(world, message),
);
Then("I am told the email is already in use", ({ world }) => notServed(world));
Then("{string} is disabled until I tick {string}", ({ world }, button: string, box: string) =>
  notServed(world, button, box),
);
Then("{string} is enabled", ({ world }, button: string) => notServed(world, button));
Then("I can copy the code", ({ world }) => notServed(world));
Then("I can download the code as a text file", ({ world }) => notServed(world));
Then("I see that new accounts are not accepted and a link to sign in", ({ world }) =>
  notServed(world),
);
