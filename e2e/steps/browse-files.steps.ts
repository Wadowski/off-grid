// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-112 exposes browsing): ${step}`);
};

Given(/^Anna creates a family named "[^"]*"$/, () =>
  notImplemented("Anna creates a family named …"),
);

When(/^Anna lists her drives$/, () => notImplemented("Anna lists her drives"));

Then(/^Anna sees her personal drive named "[^"]*"$/, () =>
  notImplemented("Anna sees her personal drive named …"),
);

Then(/^Anna sees the family drive named "[^"]*"$/, () =>
  notImplemented("Anna sees the family drive named …"),
);

When(/^Ben opens the family drive of "[^"]*"$/, () =>
  notImplemented("Ben opens the family drive of …"),
);

Then(/^Ben gets not found$/, () => notImplemented("Ben gets not found"));

When(/^Anna opens a folder that does not exist$/, () =>
  notImplemented("Anna opens a folder that does not exist"),
);

When(/^Anna opens a file that does not exist$/, () =>
  notImplemented("Anna opens a file that does not exist"),
);

Then(/^Anna gets not found$/, () => notImplemented("Anna gets not found"));

Given(/^Anna has a folder "[^"]*" with a folder "[^"]*" and a file "[^"]*"$/, () =>
  notImplemented("Anna has a folder … with a folder … and a file …"),
);

When(/^Anna opens the folder "[^"]*"$/, () => notImplemented("Anna opens the folder …"));

Then(/^Anna sees the entries "[^"]*" and "[^"]*" in that order$/, () =>
  notImplemented("Anna sees the entries … and … in that order"),
);

Then(/^the breadcrumbs of the folder are "[^"]*" then "[^"]*"$/, () =>
  notImplemented("the breadcrumbs of the folder are … then …"),
);

Given(/^Anna has the folders "[^"]*" and "[^"]*" nested in her personal drive$/, () =>
  notImplemented("Anna has the folders … and … nested in her personal drive"),
);

Then(/^the breadcrumbs of the folder are "[^"]*", "[^"]*" and "[^"]*"$/, () =>
  notImplemented("the breadcrumbs of the folder are …, … and …"),
);

Given(/^Anna has a file "[^"]*" in the folder "[^"]*"$/, () =>
  notImplemented("Anna has a file … in the folder …"),
);

When(/^Anna opens the file "[^"]*"$/, () => notImplemented("Anna opens the file …"));

Then(/^Anna sees the file "[^"]*" with the breadcrumbs "[^"]*" and "[^"]*"$/, () =>
  notImplemented("Anna sees the file … with the breadcrumbs … and …"),
);

Given(/^Anna has a folder "[^"]*" with a trashed file "[^"]*"$/, () =>
  notImplemented("Anna has a folder … with a trashed file …"),
);

Then(/^Anna does not see "[^"]*"$/, () => notImplemented("Anna does not see …"));

Given(/^Anna has a folder "[^"]*" holding \d+ files$/, () =>
  notImplemented("Anna has a folder … holding … files"),
);

Then(/^Anna sees \d+ entries with a way to get the next page$/, () =>
  notImplemented("Anna sees … entries with a way to get the next page"),
);
