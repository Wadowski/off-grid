// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-48 follow-up): ${step}`);
};

Given('an account for "anna@example.com"', () => notImplemented("an account for anna"));
When("Anna signs in with the right password", () =>
  notImplemented("Anna signs in with the right password"),
);
Then("she receives a session and can call protected endpoints", () =>
  notImplemented("she receives a session and can call protected endpoints"),
);
When("Anna signs in with a wrong password", () =>
  notImplemented("Anna signs in with a wrong password"),
);
Then('sign-in fails with a generic "email or password is incorrect" message', () =>
  notImplemented("sign-in fails with a generic message"),
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
When('Anna signs in with "remember me"', () => notImplemented('Anna signs in with "remember me"'));
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
