// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-54 follow-up): ${step}`);
};

Given("Anna saved her recovery code at sign-up", () =>
  notImplemented("Anna saved her recovery code at sign-up"),
);
Given("Anna has already used her recovery code to reset her password", () =>
  notImplemented("Anna has already used her recovery code to reset her password"),
);
Given("Anna is signed in on another device", () =>
  notImplemented("Anna is signed in on another device"),
);
Given("email is not configured", () => notImplemented("email is not configured"));
When("she resets her password with email, recovery code and a new password", () =>
  notImplemented("she resets her password with email, recovery code and a new password"),
);
When("someone uses that recovery code again", () =>
  notImplemented("someone uses that recovery code again"),
);
When("someone tries wrong recovery codes repeatedly", () =>
  notImplemented("someone tries wrong recovery codes repeatedly"),
);
When("Anna asks for a code by email", () => notImplemented("Anna asks for a code by email"));
When("someone asks for an emailed code for an email without an account", () =>
  notImplemented("someone asks for an emailed code for an email without an account"),
);
When("Anna resets her password", () => notImplemented("Anna resets her password"));
Then("she can sign in with the new password", () =>
  notImplemented("she can sign in with the new password"),
);
Then("she receives a new recovery code", () => notImplemented("she receives a new recovery code"));
Then("her old recovery code no longer works", () =>
  notImplemented("her old recovery code no longer works"),
);
Then("the reset is refused", () => notImplemented("the reset is refused"));
Then("further attempts are temporarily refused", () =>
  notImplemented("further attempts are temporarily refused"),
);
Then("a code is emailed to her valid for 15 minutes", () =>
  notImplemented("a code is emailed to her valid for 15 minutes"),
);
Then("she can reset her password with it once", () =>
  notImplemented("she can reset her password with it once"),
);
Then("asking for an emailed code is not offered", () =>
  notImplemented("asking for an emailed code is not offered"),
);
Then("the response looks the same as for an existing account", () =>
  notImplemented("the response looks the same as for an existing account"),
);
Then("the other device is signed out", () => notImplemented("the other device is signed out"));
Then("she gets a security notification in her inbox", () =>
  notImplemented("she gets a security notification in her inbox"),
);
