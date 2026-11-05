// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { Link, useLocation } from "react-router-dom";
import { SignInForm } from "../../forms/sign-in-form/sign-in-form.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { useRegistrationStatus } from "../create-account-page/use-registration-status.js";
import { isSessionEndedState } from "./is-session-ended-state.js";
import { createAccountLinkStyle, createAccountPromptStyle } from "./styles.js";

export const SignInPage = () => {
  const registration = useRegistrationStatus();
  const routeState: unknown = useLocation().state;
  const registrationOpen = registration.status === "ready" && registration.registrationOpen;

  return (
    <>
      {isSessionEndedState(routeState) && (
        <div role="alert">
          <Text variant="status" textId="session.signedOut" />
        </div>
      )}
      <AccountIntro
        icon="lock_open_right"
        pillTextId="signIn.pill"
        headingTextId="signIn.heading"
        bodyTextId="signIn.welcome"
      />
      <SignInForm />
      {registrationOpen && (
        <div style={createAccountPromptStyle}>
          <Text variant="status" textId="signIn.createPrompt" />
          <Link
            to="/create-account"
            data-testid="create-account-link"
            style={createAccountLinkStyle}
          >
            <Text variant="label" textId="signIn.createLink" />
          </Link>
        </div>
      )}
    </>
  );
};
