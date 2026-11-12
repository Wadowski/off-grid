// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-79): ${step}`);
};

Given(/^I have a personal calendar named "[^"]*" with the color "[^"]*"$/, () =>
  notImplemented("I have a personal calendar named {string} with the color {string}"),
);

When(/^I open the calendar from the navigation$/, () =>
  notImplemented("I open the calendar from the navigation"),
);

Then(/^I see the calendars list$/, () => notImplemented("I see the calendars list"));

Then(/^the sidebar lists "[^"]*" with a "[^"]*" color dot$/, () =>
  notImplemented("the sidebar lists {string} with a {string} color dot"),
);

When(
  /^I create a personal calendar named "[^"]*" with the color "[^"]*" from the calendar screen$/,
  () =>
    notImplemented(
      "I create a personal calendar named {string} with the color {string} from the calendar screen",
    ),
);

Then(/^I see the calendars list with "[^"]*"$/, () =>
  notImplemented("I see the calendars list with {string}"),
);

When(/^I create a calendar named "[^"]*" for the family "[^"]*" from the calendar screen$/, () =>
  notImplemented(
    "I create a calendar named {string} for the family {string} from the calendar screen",
  ),
);

Then(/^the calendars list shows "[^"]*" owned by "[^"]*"$/, () =>
  notImplemented("the calendars list shows {string} owned by {string}"),
);

When(/^I try to create a calendar with an empty name$/, () =>
  notImplemented("I try to create a calendar with an empty name"),
);

When(
  /^I rename the calendar "[^"]*" to "[^"]*" and change its color to "[^"]*" on the edit screen$/,
  () =>
    notImplemented(
      "I rename the calendar {string} to {string} and change its color to {string} on the edit screen",
    ),
);

When(/^I delete the calendar "[^"]*" after confirming$/, () =>
  notImplemented("I delete the calendar {string} after confirming"),
);

Then(/^I see the calendars list without "[^"]*"$/, () =>
  notImplemented("I see the calendars list without {string}"),
);

Then(/^the sidebar does not list "[^"]*"$/, () =>
  notImplemented("the sidebar does not list {string}"),
);

When(/^I open the delete confirmation for the calendar "[^"]*" and cancel it$/, () =>
  notImplemented("I open the delete confirmation for the calendar {string} and cancel it"),
);

Then(/^the calendar "[^"]*" is still listed$/, () =>
  notImplemented("the calendar {string} is still listed"),
);

When(/^I open the edit screen for my default calendar$/, () =>
  notImplemented("I open the edit screen for my default calendar"),
);

Then(/^I do not see a delete button$/, () => notImplemented("I do not see a delete button"));

When(/^I open the edit screen for a calendar I cannot access$/, () =>
  notImplemented("I open the edit screen for a calendar I cannot access"),
);

When(/^I open the calendars list at a phone width of 375 pixels$/, () =>
  notImplemented("I open the calendars list at a phone width of 375 pixels"),
);

Then(/^the page has no horizontal scroll$/, () =>
  notImplemented("the page has no horizontal scroll"),
);

When(
  /^I check the calendars list, the create calendar screen and the edit calendar screen for accessibility in light and dark theme$/,
  () =>
    notImplemented(
      "I check the calendars list, the create calendar screen and the edit calendar screen for accessibility in light and dark theme",
    ),
);

Then(/^no serious accessibility violations are found$/, () =>
  notImplemented("no serious accessibility violations are found"),
);
