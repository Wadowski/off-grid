// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Button, Text } from "@offgrid/ui";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { RECOVERY_INTRO } from "../../constants.js";
import { ResetPasswordForm } from "../../forms/reset-password-form/reset-password-form.js";
import { actionBlockStyle } from "../../forms/shared/styles.js";
import { isRecoveryRouteState } from "../../recovery/is-recovery-route-state.js";
import { AccountIntro } from "../create-account-page/components/account-intro/account-intro.js";
import { RecoveryCodeStep } from "../create-account-page/components/recovery-code-step/recovery-code-step.js";
import { noticeStyle } from "./styles.js";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const routeState: unknown = useLocation().state;
  const [recoveredCode, setRecoveredCode] = useState<string | undefined>(undefined);

  if (!isRecoveryRouteState(routeState)) {
    return <Navigate to="/forgot-password" replace />;
  }
  if (recoveredCode !== undefined) {
    return (
      <RecoveryCodeStep
        recoveryCode={recoveredCode}
        intro={RECOVERY_INTRO}
        onContinue={() => navigate("/sign-in")}
      />
    );
  }

  return (
    <>
      <AccountIntro
        icon="lock_reset"
        pillTextId="resetPassword.pill"
        headingTextId="resetPassword.heading"
        bodyTextId={
          routeState.method === "recoveryCode"
            ? "resetPassword.bodyRecoveryCode"
            : "resetPassword.bodyEmailCode"
        }
      />
      {routeState.method === "emailCode" && (
        <div role="status" style={noticeStyle}>
          <Text variant="status" textId="resetPassword.notice" />
        </div>
      )}
      <ResetPasswordForm
        email={routeState.email}
        method={routeState.method}
        onRecovered={setRecoveredCode}
      />
      <div style={actionBlockStyle}>
        <Button
          type="button"
          variant="ghost"
          data-testid="reset-password-back"
          onClick={() => navigate("/forgot-password")}
        >
          <Text variant="action" textId="resetPassword.back" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          data-testid="reset-password-cancel"
          onClick={() => navigate("/sign-in")}
        >
          <Text variant="action" textId="resetPassword.cancel" />
        </Button>
      </div>
    </>
  );
};
