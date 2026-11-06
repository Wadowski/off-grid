// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useLocation } from "react-router-dom";
import { SignInForm } from "../../forms/sign-in-form/sign-in-form.js";
import { CreateAccountLink } from "../../session/components/create-account-link/create-account-link.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { useRegistrationStatus } from "../create-account-page/use-registration-status.js";
import { isSessionEndedState } from "./is-session-ended-state.js";
import { signInPagePromptStyle } from "./styles.js";

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
        <div style={signInPagePromptStyle}>
          <Text variant="status" textId="signIn.createPrompt" />
          <CreateAccountLink />
        </div>
      )}
    </>
  );
};
