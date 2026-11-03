// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Text } from "@offgrid/ui";
import { useState } from "react";
import { CreateAccountForm } from "../../forms/create-account-form/create-account-form.js";
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
    return <RecoveryCodeStep recoveryCode={step.recoveryCode} />;
  }
  if (step.kind === "closed" || !registration.registrationOpen) {
    return <RegistrationClosed />;
  }
  return (
    <>
      <Text
        variant="heading"
        textId={
          registration.freshServer ? "createAccount.firstRunHeading" : "createAccount.heading"
        }
      />
      {registration.freshServer && <Text variant="body" textId="createAccount.firstRunBody" />}
      <CreateAccountForm
        onCreated={(recoveryCode) => setStep({ kind: "recovery", recoveryCode })}
        onRegistrationClosed={() => setStep({ kind: "closed" })}
      />
    </>
  );
};
