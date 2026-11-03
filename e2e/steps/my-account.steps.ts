// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createBdd } from "playwright-bdd";
import { test } from "../support/fixtures.js";

const { Given, When, Then } = createBdd(test);

const notImplemented = (step: string): never => {
  throw new Error(`Step not implemented yet (OG-51 follow-up): ${step}`);
};

Given("Anna is signed in and belongs to two families", () =>
  notImplemented("Anna is signed in and belongs to two families"),
);
Given("Anna is signed in on a laptop and a phone", () =>
  notImplemented("Anna is signed in on a laptop and a phone"),
);
Given("Ben is signed in on his own laptop", () =>
  notImplemented("Ben is signed in on his own laptop"),
);
When("she opens her profile", () => notImplemented("she opens her profile"));
When("she changes her display name to Anna Kowalska", () =>
  notImplemented("she changes her display name to Anna Kowalska"),
);
When("she changes her display name to an empty name", () =>
  notImplemented("she changes her display name to an empty name"),
);
When("Anna changes her password giving the right current password", () =>
  notImplemented("Anna changes her password giving the right current password"),
);
When("Anna tries to change her password to one that breaks the password rules", () =>
  notImplemented("Anna tries to change her password to one that breaks the password rules"),
);
When("Anna tries to change her password with a wrong current password", () =>
  notImplemented("Anna tries to change her password with a wrong current password"),
);
When("she ends the session on the phone", () =>
  notImplemented("she ends the session on the phone"),
);
When("Anna chooses to sign out of all other sessions", () =>
  notImplemented("Anna chooses to sign out of all other sessions"),
);
When("Anna tries to end Ben's session", () => notImplemented("Anna tries to end Ben's session"));
When("Anna regenerates her recovery code with her password", () =>
  notImplemented("Anna regenerates her recovery code with her password"),
);
When("Anna tries to regenerate her recovery code with a wrong password", () =>
  notImplemented("Anna tries to regenerate her recovery code with a wrong password"),
);
Then("she sees her name, email, role and both families", () =>
  notImplemented("she sees her name, email, role and both families"),
);
Then("her profile shows Anna Kowalska", () => notImplemented("her profile shows Anna Kowalska"));
Then("the new password works for sign-in", () =>
  notImplemented("the new password works for sign-in"),
);
Then("her other sessions are signed out", () =>
  notImplemented("her other sessions are signed out"),
);
Then("her current session stays valid", () => notImplemented("her current session stays valid"));
Then("her display name is unchanged", () => notImplemented("her display name is unchanged"));
Then("her password is unchanged", () => notImplemented("her password is unchanged"));
Then("she sees both sessions and the current one is marked", () =>
  notImplemented("she sees both sessions and the current one is marked"),
);
Then("the phone session no longer works", () =>
  notImplemented("the phone session no longer works"),
);
Then("only the current session stays valid", () =>
  notImplemented("only the current session stays valid"),
);
Then("Ben's session still works", () => notImplemented("Ben's session still works"));
Then("she sees the new code once", () => notImplemented("she sees the new code once"));
Then("the old code no longer works", () => notImplemented("the old code no longer works"));
Then("her recovery code is unchanged", () => notImplemented("her recovery code is unchanged"));
