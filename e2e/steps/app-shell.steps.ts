// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test, type ScenarioWorld } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notServed = (_world: ScenarioWorld, ...details: unknown[]): never => {
  throw new Error(
    `The e2e stack does not serve the web app yet, so the app shell step cannot run: ${details.join(", ")}.`,
  );
};

Given("I am signed in as {string}, a regular member", ({ world }, name: string) =>
  notServed(world, name),
);
Given("I am signed in as the admin", ({ world }) => notServed(world));
Given("I am signed in as a regular member", ({ world }) => notServed(world));
Given("a {int} px wide screen", ({ world }, width: number) => notServed(world, width));
When("I open the user menu", ({ world }) => notServed(world));
When("I use only the keyboard", ({ world }) => notServed(world));
When("I choose {string} in the user menu", ({ world }, item: string) => notServed(world, item));
Then("the header shows my initials", ({ world }) => notServed(world));
Then("I see my name, my email and the badge {string}", ({ world }, badge: string) =>
  notServed(world, badge),
);
Then("I see {string}", ({ world }, label: string) => notServed(world, label));
Then("I do not see {string}", ({ world }, label: string) => notServed(world, label));
Then(
  "the bottom navigation shows {string} and {string}",
  ({ world }, first: string, second: string) => notServed(world, first, second),
);
Then("the sidebar shows {string} and {string}", ({ world }, first: string, second: string) =>
  notServed(world, first, second),
);
Then("the sidebar shows my name and the families I belong to", ({ world }) => notServed(world));
Then("the header shows the title of the page I am on", ({ world }) => notServed(world));
Then("I can reach the navigation and the user menu and close the menu with Escape", ({ world }) =>
  notServed(world),
);
Then("I am signed out", ({ world }) => notServed(world));
