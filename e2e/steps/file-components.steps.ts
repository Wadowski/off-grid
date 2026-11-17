// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(
    `Step not implemented yet (OG-123 and OG-124 render the file components): ${step}`,
  );
};

Given(/^a family with a folder "[^"]*" holding \d+ items$/, () =>
  notImplemented("a family with a folder … holding … items"),
);

When(/^I open the file browser$/, () => notImplemented("I open the file browser"));

Then(/^I see the folder "[^"]*" with "[^"]*"$/, () => notImplemented("I see the folder … with …"));

Given(/^a family with a file "[^"]*" of [\d.]+ MB changed yesterday$/, () =>
  notImplemented("a family with a file … of … MB changed yesterday"),
);

Then(/^I see the file "[^"]*" with "[^"]*" and "[^"]*"$/, () =>
  notImplemented("I see the file … with … and …"),
);

Given(/^a family with a file with a very long name$/, () =>
  notImplemented("a family with a file with a very long name"),
);

When(/^I open the file browser on a \d+ px wide screen$/, () =>
  notImplemented("I open the file browser on a … px wide screen"),
);

Then(/^the file name is shortened to fit on one line$/, () =>
  notImplemented("the file name is shortened to fit on one line"),
);

Then(/^the full file name is available on request$/, () =>
  notImplemented("the full file name is available on request"),
);

Given(/^a family with a file of type "[^"]*"$/, () =>
  notImplemented("a family with a file of type …"),
);

Then(/^the file shows the "[^"]*" icon$/, () => notImplemented("the file shows the … icon"));

Given(/^a family with a file "[^"]*"$/, () => notImplemented("a family with a file …"));

When(/^I select the file "[^"]*"$/, () => notImplemented("I select the file …"));

Then(/^the file "[^"]*" is marked as selected$/, () =>
  notImplemented("the file … is marked as selected"),
);

When(/^I focus the file "[^"]*" and press Enter$/, () =>
  notImplemented("I focus the file … and press Enter"),
);

Then(/^the file "[^"]*" is opened$/, () => notImplemented("the file … is opened"));

Given(/^a family with a file "[^"]*" of [\d.]+ MB$/, () =>
  notImplemented("a family with a file … of … MB"),
);

When(/^I open the file browser in the dark theme$/, () =>
  notImplemented("I open the file browser in the dark theme"),
);

Then(/^I see the file "[^"]*" with "[^"]*"$/, () => notImplemented("I see the file … with …"));

Given(/^a family with a file "[^"]*" and a folder "[^"]*"$/, () =>
  notImplemented("a family with a file … and a folder …"),
);

Then(/^the file browser has no accessibility violations$/, () =>
  notImplemented("the file browser has no accessibility violations"),
);
