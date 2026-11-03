// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notServed = (_world: ScenarioWorld, ...details: unknown[]): never => {
  throw new Error(
    `The e2e stack does not serve the web app yet, so the web session step cannot run: ${details.join(", ")}.`,
  );
};

Given("I am not signed in", ({ world }) => notServed(world));
Given("I am signed in", ({ world }) => notServed(world));
Given("my access has expired but my session is valid", ({ world }) => notServed(world));
Given("my session was ended elsewhere", ({ world }) => notServed(world));
Given("the server has no accounts yet", ({ world }) => notServed(world));
When("I open {string}", ({ world }, path: string) => notServed(world, path));
When("I open the sign-in page", ({ world }) => notServed(world));
When("I open the app", ({ world }) => notServed(world));
When("I use the app", ({ world }) => notServed(world));
When("I choose {string}", ({ world }, item: string) => notServed(world, item));
Then("I am taken to the sign-in page", ({ world }) => notServed(world));
Then("after signing in I land on {string}", ({ world }, path: string) => notServed(world, path));
Then("I am taken to the home page", ({ world }) => notServed(world));
Then("I stay signed in without being asked for my password", ({ world }) => notServed(world));
Then("I am taken to sign-in with the message {string}", ({ world }, message: string) =>
  notServed(world, message),
);
Then("I am taken to the set-up page that creates the first admin account", ({ world }) =>
  notServed(world),
);
Then("I am taken to sign-in and protected pages are closed to me", ({ world }) => notServed(world));
