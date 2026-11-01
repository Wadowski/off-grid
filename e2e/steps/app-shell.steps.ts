// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

// The e2e stack runs only the API today; the web app is not wired in yet.
const notServed = (): never => {
  throw new Error(
    "The e2e stack does not serve the web app yet, so the app shell cannot be opened.",
  );
};

Given("I am signed in as {string}, a regular member", notServed);
Given("I am signed in as the admin", notServed);
Given("I am signed in as a regular member", notServed);
Given("a {int} px wide screen", notServed);
When("I open the user menu", notServed);
When("I use only the keyboard", notServed);
When("I choose {string} in the user menu", notServed);
Then("the header shows my initials", notServed);
Then("I see my name, my email and the badge {string}", notServed);
Then("I see {string}", notServed);
Then("I do not see {string}", notServed);
Then("the bottom navigation shows {string} and {string}", notServed);
Then("I can reach the navigation and the user menu and close the menu with Escape", notServed);
Then("I am signed out", notServed);
