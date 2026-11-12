// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet, useOutletContext } from "react-router-dom";
import { useCalendars } from "../../calendars/use-calendars.js";
import { signOut } from "../../session/sign-out.js";
import { useSession } from "../../session/use-session.js";
import type { CurrentUser, FamiliesContext, ShellContext } from "../../types.js";
import { AppHeader } from "./components/app-header/app-header.js";
import { AppSidebar } from "./components/app-sidebar/app-sidebar.js";
import { MobileTabBar } from "./components/mobile-tab-bar/mobile-tab-bar.js";
import { appShellCss, appShellStyle } from "./styles.js";

export const AppShell = () => {
  const session = useSession();
  const familiesState = useOutletContext<FamiliesContext>();
  const calendarsState = useCalendars(session.status === "signedIn");
  const shellContext: ShellContext = { ...familiesState, calendars: calendarsState };
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
      <AppSidebar
        user={user}
        families={familiesState.families}
        calendars={calendarsState.calendars}
        onSignOut={() => void signOut()}
      />
      <AppHeader />
      <main className="og-shell-main">
        <Outlet context={shellContext} />
      </main>
      <MobileTabBar />
    </div>
  );
};
