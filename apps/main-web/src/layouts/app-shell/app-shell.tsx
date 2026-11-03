// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { Outlet } from "react-router-dom";
import { signOut } from "../../session/sign-out.js";
import { useSession } from "../../session/use-session.js";
import type { CurrentUser } from "../../types.js";
import { AppHeader } from "./components/app-header/app-header.js";
import { appShellCss, appShellMainStyle, appShellStyle } from "./styles.js";

export const AppShell = () => {
  const session = useSession();
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
      <AppHeader user={user} onSignOut={() => void signOut()} />
      <main className="og-app-shell-main" style={appShellMainStyle}>
        <Outlet />
      </main>
    </div>
  );
};
