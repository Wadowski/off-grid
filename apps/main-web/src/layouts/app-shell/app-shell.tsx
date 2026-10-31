// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/app-header/app-header.js";
import { appShellMainStyle, appShellStyle } from "./styles.js";

export const AppShell = () => (
  <div style={appShellStyle}>
    <AppHeader />
    <main style={appShellMainStyle}>
      <Outlet />
    </main>
  </div>
);
