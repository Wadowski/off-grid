// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-78 follow-up): ${step}`);
};

Given(/^Anna belongs to the family "[^"]*" and has a personal calendar named "[^"]*"$/, () =>
  notImplemented("Anna belongs to the family {string} and has a personal calendar named {string}"),
);

Given(/^Ben belongs to his own family and has a personal calendar named "[^"]*"$/, () =>
  notImplemented("Ben belongs to his own family and has a personal calendar named {string}"),
);

When(/^Anna lists her calendars$/, () => notImplemented("Anna lists her calendars"));

Then(/^she sees "[^"]*" and "[^"]*"$/, () => notImplemented("she sees {string} and {string}"));

Then(/^she does not see "[^"]*"$/, () => notImplemented("she does not see {string}"));

When(/^she creates a personal calendar named "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented("she creates a personal calendar named {string} with the color {string}"),
);

Then(/^the calendar "[^"]*" exists with the color "[^"]*" for Anna only$/, () =>
  notImplemented("the calendar {string} exists with the color {string} for Anna only"),
);

When(/^Ben creates a calendar named "[^"]*" in the family "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented(
    "Ben creates a calendar named {string} in the family {string} with the color {string}",
  ),
);

Then(/^Anna sees the calendar "[^"]*"$/, () => notImplemented("Anna sees the calendar {string}"));

Given(/^the family "[^"]*" has a calendar named "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented("the family {string} has a calendar named {string} with the color {string}"),
);

When(/^Ben renames the calendar "[^"]*" to "[^"]*" and recolors it "[^"]*"$/, () =>
  notImplemented("Ben renames the calendar {string} to {string} and recolors it {string}"),
);

Then(/^the calendar "[^"]*" has the color "[^"]*"$/, () =>
  notImplemented("the calendar {string} has the color {string}"),
);

Given(/^the family "[^"]*" has a calendar named "[^"]*" with two events$/, () =>
  notImplemented("the family {string} has a calendar named {string} with two events"),
);

When(/^Ben deletes the calendar "[^"]*"$/, () =>
  notImplemented("Ben deletes the calendar {string}"),
);

Then(/^the calendar "[^"]*" no longer exists$/, () =>
  notImplemented("the calendar {string} no longer exists"),
);

Then(/^a "[^"]*" event is published for each of its two events$/, () =>
  notImplemented("a {string} event is published for each of its two events"),
);

Given(/^Anna has her default calendar$/, () => notImplemented("Anna has her default calendar"));

When(/^Anna deletes her default calendar$/, () =>
  notImplemented("Anna deletes her default calendar"),
);

Then(/^the default calendar still exists$/, () =>
  notImplemented("the default calendar still exists"),
);

When(/^Ben looks at the calendar "[^"]*"$/, () =>
  notImplemented("Ben looks at the calendar {string}"),
);

Then(/^Ben cannot see the calendar "[^"]*"$/, () =>
  notImplemented("Ben cannot see the calendar {string}"),
);
Then(/^Ben cannot use the family "[^"]*"$/, () =>
  notImplemented("Ben cannot use the family {string}"),
);
Then(/^the name is refused as invalid$/, () => notImplemented("the name is refused as invalid"));

When(/^Ben renames the calendar "[^"]*" to "[^"]*"$/, () =>
  notImplemented("Ben renames the calendar {string} to {string}"),
);

Then(/^the calendar "[^"]*" is still named "[^"]*"$/, () =>
  notImplemented("the calendar {string} is still named {string}"),
);

Then(/^the calendar "[^"]*" still exists$/, () =>
  notImplemented("the calendar {string} still exists"),
);

When(/^Ben creates a calendar named "[^"]*" in the family "[^"]*"$/, () =>
  notImplemented("Ben creates a calendar named {string} in the family {string}"),
);

Then(/^Ben gets not-found for the family "[^"]*"$/, () =>
  notImplemented("Ben gets not-found for the family {string}"),
);

When(/^Ben leaves the family "[^"]*"$/, () => notImplemented("Ben leaves the family {string}"));

Then(/^Ben does not see "[^"]*"$/, () => notImplemented("Ben does not see {string}"));

Then(/^the request fails with a validation error$/, () =>
  notImplemented("the request fails with a validation error"),
);

Given(/^Ben belongs to his own family$/, () => notImplemented("Ben belongs to his own family"));
