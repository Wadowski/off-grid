// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useState } from "react";
import { CreateAccountForm } from "../../forms/create-account-form/create-account-form.js";
import { RECOVERY_INTRO } from "../../constants.js";
import { completeRegistration } from "../../session/complete-registration.js";
import { AccountIntro } from "./components/account-intro/account-intro.js";
import { RecoveryCodeStep } from "./components/recovery-code-step/recovery-code-step.js";
import { RegistrationClosed } from "./components/registration-closed/registration-closed.js";
import { useRegistrationStatus } from "./use-registration-status.js";
import type { CreateAccountStep } from "./types.js";

export const CreateAccountPage = () => {
  const registration = useRegistrationStatus();
  const [step, setStep] = useState<CreateAccountStep>({ kind: "form" });

  if (registration.status === "loading") {
    return <Text variant="body" textId="session.loading" />;
  }
  if (step.kind === "recovery") {
    return (
      <RecoveryCodeStep
        recoveryCode={step.recoveryCode}
        intro={RECOVERY_INTRO}
        onContinue={completeRegistration}
      />
    );
  }
  if (step.kind === "closed" || !registration.registrationOpen) {
    return <RegistrationClosed />;
  }
  const firstRun = registration.freshServer;
  return (
    <>
      <AccountIntro
        icon="lock_open_right"
        pillTextId="createAccount.pill.account"
        headingTextId={firstRun ? "createAccount.firstRunHeading" : "createAccount.heading"}
        bodyTextId={firstRun ? "createAccount.firstRunBody" : "createAccount.body"}
      />
      <CreateAccountForm
        onCreated={(recoveryCode) => setStep({ kind: "recovery", recoveryCode })}
        onRegistrationClosed={() => setStep({ kind: "closed" })}
      />
    </>
  );
};
