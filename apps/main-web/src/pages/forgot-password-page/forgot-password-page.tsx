// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { ForgotPasswordForm } from "../../forms/forgot-password-form/forgot-password-form.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { usePasswordRecoveryOptions } from "./use-password-recovery-options.js";

export const ForgotPasswordPage = () => {
  const emailCodeAvailable = usePasswordRecoveryOptions();

  return (
    <>
      <AccountIntro
        icon="lock_reset"
        pillTextId="forgotPassword.pill"
        headingTextId="forgotPassword.heading"
        bodyTextId="forgotPassword.body"
      />
      <ForgotPasswordForm emailCodeAvailable={emailCodeAvailable} />
    </>
  );
};
