// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CreateAccountPage } from "./pages/create-account-page/create-account-page.js";
import { FamiliesPage } from "./pages/families-page/families-page.js";
import { FirstFamilyPage } from "./pages/first-family-page/first-family-page.js";
import { ForgotPasswordPage } from "./pages/forgot-password-page/forgot-password-page.js";
import { ResetPasswordPage } from "./pages/reset-password-page/reset-password-page.js";
import { SignInPage } from "./pages/sign-in-page/sign-in-page.js";
import { SettingsPage } from "./pages/settings-page/settings-page.js";
import { SettingsProfilePage } from "./pages/settings-profile-page/settings-profile-page.js";
import { SettingsPasswordPage } from "./pages/settings-password-page/settings-password-page.js";
import { SettingsDevicesPage } from "./pages/settings-devices-page/settings-devices-page.js";
import { SettingsRecoveryCodePage } from "./pages/settings-recovery-code-page/settings-recovery-code-page.js";
import { AppShell } from "./layouts/app-shell/app-shell.js";
import { AuthLayout } from "./layouts/auth-layout/auth-layout.js";
import { FamilyDataLayout } from "./families/family-data-layout/family-data-layout.js";
import { FamilyOnboardingGate } from "./families/family-onboarding-gate/family-onboarding-gate.js";
import { FIRST_FAMILY_PATH } from "./constants.js";
import { RedirectIfSignedIn } from "./session/guards/redirect-if-signed-in/redirect-if-signed-in.js";
import { RequireSignedIn } from "./session/guards/require-signed-in/require-signed-in.js";
import { startSession } from "./session/start-session.js";

export const App = () => {
  useEffect(() => {
    void startSession();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route element={<RedirectIfSignedIn />}>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>
        <Route element={<RequireSignedIn />}>
          <Route element={<FamilyDataLayout />}>
            <Route element={<FamilyOnboardingGate />}>
              <Route element={<AuthLayout />}>
                <Route path={FIRST_FAMILY_PATH} element={<FirstFamilyPage />} />
              </Route>
              <Route element={<AppShell />}>
                <Route index element={<FamiliesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/profile" element={<SettingsProfilePage />} />
                <Route path="settings/password" element={<SettingsPasswordPage />} />
                <Route path="settings/devices" element={<SettingsDevicesPage />} />
                <Route path="settings/recovery-code" element={<SettingsRecoveryCodePage />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
