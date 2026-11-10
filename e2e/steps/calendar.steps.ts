// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-76 follow-up): ${step}`);
};

Given("Anna and Ben each belong to their own family", () =>
  notImplemented("Anna and Ben each belong to their own family"),
);

Given(/^Anna's family has a calendar named "[^"]*"$/, () =>
  notImplemented("Anna's family has a calendar named"),
);

Given(/^Anna has a personal calendar named "[^"]*"$/, () =>
  notImplemented("Anna has a personal calendar named"),
);

Given("Ben belongs to a family of his own", () =>
  notImplemented("Ben belongs to a family of his own"),
);

When("Ben looks at the calendars", () => notImplemented("Ben looks at the calendars"));

Then("Ben sees no calendars", () => notImplemented("Ben sees no calendars"));
