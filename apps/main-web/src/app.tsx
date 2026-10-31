// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { FamiliesPage } from "./families/families-page.js";
import { AppShell } from "./shell/app-shell.js";

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<FamiliesPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
