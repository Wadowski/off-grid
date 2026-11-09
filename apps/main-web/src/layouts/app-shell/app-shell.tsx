// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext } from "react-router-dom";
import { signOut } from "../../session/sign-out.js";
import { useSession } from "../../session/use-session.js";
import type { CurrentUser, FamiliesContext } from "../../types.js";
import { AppHeader } from "./components/app-header/app-header.js";
import { AppSidebar } from "./components/app-sidebar/app-sidebar.js";
import { MobileTabBar } from "./components/mobile-tab-bar/mobile-tab-bar.js";
import { appShellCss, appShellStyle } from "./styles.js";

export const AppShell = () => {
  const session = useSession();
  const familiesState = useOutletContext<FamiliesContext>();
  if (session.status !== "signedIn") {
    return null;
  }
  const user: CurrentUser = {
    name: session.user.displayName,
    email: session.user.email,
    role: session.user.instanceRole === "admin" ? "admin" : "member",
  };

  return (
    <div style={appShellStyle}>
      <style>{appShellCss}</style>
      <AppSidebar user={user} families={familiesState.families} onSignOut={() => void signOut()} />
      <AppHeader />
      <main className="og-shell-main">
        <Outlet context={familiesState} />
      </main>
      <MobileTabBar />
    </div>
  );
};
