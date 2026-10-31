// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { When, Then } = createBdd(test);

// The e2e stack runs only the API today; the web app and axe are not wired in yet.
When("I open the Families screen", () => {
  throw new Error(
    "The e2e stack does not serve the web app yet, so the Families screen cannot be opened.",
  );
});

Then("the Families screen has no serious accessibility violations", () => {
  throw new Error(
    "Accessibility checks need the web app in the e2e stack, which is not wired up yet.",
  );
});
