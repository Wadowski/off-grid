// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CreateAccountPage } from "./pages/create-account-page/create-account-page.js";
import { FamiliesPage } from "./pages/families-page/families-page.js";
import { SignInPage } from "./pages/sign-in-page/sign-in-page.js";
import { AppShell } from "./layouts/app-shell/app-shell.js";
import { AuthLayout } from "./layouts/auth-layout/auth-layout.js";
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
          </Route>
        </Route>
        <Route element={<RequireSignedIn />}>
          <Route element={<AppShell />}>
            <Route index element={<FamiliesPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
