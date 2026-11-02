// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

// playwright-bdd requires the fixtures pattern as the first parameter, even when a stub ignores it.
/* eslint-disable no-empty-pattern */
const { Given, When, Then } = createBdd(test);

// The sign-in scenarios stay @wip until the e2e stack runs (infra/compose is still empty).
// Each step fails loudly so an accidental run cannot pass.
const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-48 follow-up): ${step}`);
};

Given("an account for {string}", ({}, email: string) => notImplemented(`an account for ${email}`));
When("Anna signs in with the right password", () =>
  notImplemented("Anna signs in with the right password"),
);
Then("she receives a session and can call protected endpoints", () =>
  notImplemented("she receives a session and can call protected endpoints"),
);
When("Anna signs in with a wrong password", () =>
  notImplemented("Anna signs in with a wrong password"),
);
Then("sign-in fails with a generic {string} message", ({}, message: string) =>
  notImplemented(`sign-in fails with a generic "${message}" message`),
);
When("someone signs in with an email that has no account", () =>
  notImplemented("someone signs in with an email that has no account"),
);
Then("the response is the same as for a wrong password", () =>
  notImplemented("the response is the same as for a wrong password"),
);
When("Anna enters a wrong password 5 times in a row", () =>
  notImplemented("Anna enters a wrong password 5 times in a row"),
);
Then("further attempts are refused for a short time", () =>
  notImplemented("further attempts are refused for a short time"),
);
Then("after that time she can try again", () =>
  notImplemented("after that time she can try again"),
);
When("Anna signs in with {string}", ({}, option: string) =>
  notImplemented(`Anna signs in with "${option}"`),
);
Then("her session stays valid for 30 days instead of the default", () =>
  notImplemented("her session stays valid for 30 days"),
);
Given("Anna is signed in", () => notImplemented("Anna is signed in"));
When("the app renews her session", () => notImplemented("the app renews her session"));
Then("Anna gets new credentials and the old renewal credential no longer works", () =>
  notImplemented("Anna gets new credentials and the old renewal credential no longer works"),
);
When("Anna signs out", () => notImplemented("Anna signs out"));
Then("that session can no longer be used or renewed", () =>
  notImplemented("that session can no longer be used or renewed"),
);
Given("an admin disabled Anna's account", () => notImplemented("an admin disabled Anna's account"));
When("Anna tries to sign in", () => notImplemented("Anna tries to sign in"));
Then("she is refused", () => notImplemented("she is refused"));
