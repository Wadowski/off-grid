// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet } from "react-router-dom";
import { STUB_CURRENT_USER } from "../../auth/stub-current-user.js";
import { AppHeader } from "./components/app-header/app-header.js";
import { appShellCss, appShellMainStyle, appShellStyle } from "./styles.js";

const signOutUnavailable = () => undefined;

export const AppShell = () => (
  <div style={appShellStyle}>
    <style>{appShellCss}</style>
    <AppHeader user={STUB_CURRENT_USER} onSignOut={signOutUnavailable} />
    <main className="og-app-shell-main" style={appShellMainStyle}>
      <Outlet />
    </main>
  </div>
);
