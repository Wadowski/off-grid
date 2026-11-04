// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { SignInLink } from "../../../../session/components/sign-in-link/sign-in-link.js";
import { AccountIntro } from "../account-intro/account-intro.js";
import { closedSignInStyle } from "./styles.js";

export const RegistrationClosed = () => (
  <>
    <AccountIntro
      icon="lock"
      pillTextId="createAccount.pill.closed"
      headingTextId="createAccount.closed.heading"
      bodyTextId="createAccount.closed.body"
    />
    <div style={closedSignInStyle}>
      <SignInLink />
    </div>
  </>
);
