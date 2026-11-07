// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-54 follow-up): ${step}`);
};

Given("Anna has an account", () => notImplemented("Anna has an account"));
Given("Anna has already reset her password with her recovery code", () =>
  notImplemented("Anna has already reset her password with her recovery code"),
);
Given("Anna has asked for an emailed code", () =>
  notImplemented("Anna has asked for an emailed code"),
);
Given("Anna is signed in on another device", () =>
  notImplemented("Anna is signed in on another device"),
);
When("she resets her password with email, recovery code and a new password", () =>
  notImplemented("she resets her password with email, recovery code and a new password"),
);
When("someone uses that recovery code again", () =>
  notImplemented("someone uses that recovery code again"),
);
When("someone tries five wrong recovery codes for her email", () =>
  notImplemented("someone tries five wrong recovery codes for her email"),
);
When("Anna asks for an emailed code", () => notImplemented("Anna asks for an emailed code"));
When("she resets her password with that emailed code and a new password", () =>
  notImplemented("she resets her password with that emailed code and a new password"),
);
When("someone asks for an emailed code for an email without an account", () =>
  notImplemented("someone asks for an emailed code for an email without an account"),
);
Then("she can sign in with the new password", () =>
  notImplemented("she can sign in with the new password"),
);
Then("she receives a new recovery code", () => notImplemented("she receives a new recovery code"));
Then("the reset is refused and the password does not change", () =>
  notImplemented("the reset is refused and the password does not change"),
);
Then("further attempts are temporarily refused", () =>
  notImplemented("further attempts are temporarily refused"),
);
Then("a code is emailed to her valid for 10 minutes", () =>
  notImplemented("a code is emailed to her valid for 10 minutes"),
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
