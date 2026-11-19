// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-112 exposes drives): ${step}`);
};

Given(/^a new person (?:Anna|Ben) signs up$/, () =>
  notImplemented("a new person … signs up"),
);

When(/^her personal drive is created$/, () => notImplemented("her personal drive is created"));

When(/^her personal drive is created twice$/, () =>
  notImplemented("her personal drive is created twice"),
);

Then(/^Anna has exactly one personal drive named "[^"]*"$/, () =>
  notImplemented("Anna has exactly one personal drive named …"),
);

Given(/^a new family named "[^"]*" is created by Anna$/, () =>
  notImplemented("a new family named … is created by Anna"),
);

When(/^the family drive is created$/, () => notImplemented("the family drive is created"));

Then(/^"[^"]*" has exactly one family drive named "[^"]*"$/, () =>
  notImplemented("… has exactly one family drive named …"),
);

Given(/^Anna has a personal drive$/, () => notImplemented("Anna has a personal drive"));

Given(/^Ben is another person$/, () => notImplemented("Ben is another person"));

When(/^Ben lists the drives he can see$/, () => notImplemented("Ben lists the drives he can see"));

Then(/^Ben sees no personal drive of Anna$/, () =>
  notImplemented("Ben sees no personal drive of Anna"),
);

Given(/^"[^"]*" has a family drive$/, () => notImplemented("… has a family drive"));

Given(/^Anna is a member of "[^"]*"$/, () => notImplemented("Anna is a member of …"));

Given(/^Ben is not a member of "[^"]*"$/, () => notImplemented("Ben is not a member of …"));

When(/^Anna and Ben list the drives they can see$/, () =>
  notImplemented("Anna and Ben list the drives they can see"),
);

Then(/^Anna sees the family drive of "[^"]*"$/, () =>
  notImplemented("Anna sees the family drive of …"),
);

Then(/^Ben sees no family drive of "[^"]*"$/, () =>
  notImplemented("Ben sees no family drive of …"),
);
